import { cookies as nextCookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { Kid, AvatarColor, Parent } from "@/app/data/kids";
import { avatarColors } from "@/app/data/kids";

type CookieStore = Awaited<ReturnType<typeof nextCookies>>;

type ChildRow = {
  id: string;
  room_id: string;
  full_name: string;
  birth_date: string;
  enrolled_at: string;
  medical_notes: string | null;
  allergy_tags: string[] | null;
  photo_consent: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  room?: { name: string } | null;
};

const monthNames = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

function formatMonthYear(dateStr: string): string {
  const d = new Date(dateStr);
  return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function formatBirthDate(raw: string): string {
  const d = new Date(raw);
  return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

function getAvatarColor(id: string): AvatarColor {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

async function fetchParentsForChild(
  childId: string,
  supabase: ReturnType<typeof createClient>
): Promise<Parent[]> {
  const parents: Parent[] = [];

  const { data: invitations } = await supabase
    .from("invitations")
    .select("full_name, email, relationship, status")
    .eq("child_id", childId)
    .eq("status", "pending");

  if (invitations) {
    for (const inv of invitations) {
      parents.push({
        name: inv.full_name,
        initial: inv.full_name.charAt(0).toUpperCase(),
        role: inv.relationship === "guardian" ? "tutor" : inv.relationship,
        status: "pending",
        email: inv.email,
      });
    }
  }

  const { data: links } = await supabase
    .from("parent_children")
    .select("parent_id, relationship")
    .eq("child_id", childId);

  if (links && links.length > 0) {
    const parentIds = links.map((l) => l.parent_id);
    const { data: users } = await supabase
      .from("users")
      .select("id, full_name, status")
      .in("id", parentIds);

    const userMap = new Map<string, { full_name: string; status: string }>();
    if (users) {
      for (const u of users) {
        if (u.full_name) {
          userMap.set(u.id, { full_name: u.full_name, status: u.status || "pending" });
        }
      }
    }

    for (const link of links) {
      const user = userMap.get(link.parent_id);
      if (user) {
        parents.push({
          name: user.full_name,
          initial: user.full_name.charAt(0).toUpperCase(),
          role: link.relationship === "guardian" ? "tutor" : link.relationship,
          status: user.status === "active" ? "active" : "pending",
        });
      }
    }
  }

  return parents;
}

function childToKid(row: ChildRow, parents: Parent[] = []): Kid {
  return {
    id: row.id,
    name: row.full_name,
    initial: row.full_name.charAt(0).toUpperCase(),
    avatarColor: getAvatarColor(row.id),
    ageYears: calculateAge(row.birth_date),
    birthDate: formatBirthDate(row.birth_date),
    room: row.room?.name || "Unknown",
    enrollment: formatMonthYear(row.enrolled_at),
    allergyLabel: row.allergy_tags && row.allergy_tags.length > 0 ? row.allergy_tags[0].toUpperCase() : undefined,
    allergyNote: row.medical_notes || undefined,
    parents,
  };
}

export async function fetchKids(cookieStore: CookieStore): Promise<Kid[]> {
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("children")
    .select("*, room:rooms(name)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching kids:", error);
    return [];
  }

  const kids: Kid[] = [];
  for (const row of data as ChildRow[] || []) {
    const parents = await fetchParentsForChild(row.id, supabase);
    kids.push(childToKid(row, parents));
  }
  return kids;
}

export async function fetchKidById(
  id: string,
  cookieStore: CookieStore,
): Promise<Kid | null> {
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("children")
    .select("*, room:rooms(name)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  const parents = await fetchParentsForChild(data.id, supabase);
  return childToKid(data as ChildRow, parents);
}

export async function fetchRooms(cookieStore: CookieStore): Promise<{ id: string; name: string }[]> {
  const supabase = createClient(cookieStore);

  const { data: daycare, error: daycareError } = await supabase
    .from("daycares")
    .select("id")
    .eq("name", "Guardería Sala Soles")
    .single();

  if (daycareError || !daycare) {
    console.error("Error fetching daycare:", daycareError);
    return [];
  }

  const { data, error } = await supabase
    .from("rooms")
    .select("id, name")
    .eq("daycare_id", daycare.id)
    .order("name");

  if (error) {
    console.error("Error fetching rooms:", error);
    return [];
  }

  return (data as { id: string; name: string }[]) || [];
}

function parseBirthDate(ddmmyyyy: string): string {
  const [dd, mm, yyyy] = ddmmyyyy.split("/");
  return `${yyyy}-${mm}-${dd}`;
}

export async function createChild(
  input: { fullName: string; birthDate: string; roomId: string; allergyTags?: string[]; medicalNotes?: string },
  cookieStore: CookieStore,
): Promise<Kid> {
  const supabase = createClient(cookieStore);

  const birthDateISO = input.birthDate.includes("/")
    ? parseBirthDate(input.birthDate)
    : input.birthDate;

  const { data, error } = await supabase
    .from("children")
    .insert({
      room_id: input.roomId,
      full_name: input.fullName,
      birth_date: birthDateISO,
      allergy_tags: input.allergyTags || [],
      medical_notes: input.medicalNotes || null,
    })
    .select("*, room:rooms(name)")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Failed to create child");
  }

  return childToKid(data as ChildRow);
}
