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

function childToKid(row: ChildRow): Kid {
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
    parents: [] as Parent[],
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

  return (data as ChildRow[] || []).map(childToKid);
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

  return childToKid(data as ChildRow);
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
