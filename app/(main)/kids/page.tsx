import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { fetchKids, fetchRooms, createChild as createChildDb } from "@/lib/db/kids";
import KidsBrowser from "@/components/kids-browser";
import AddKidDialogContainer from "@/components/add-kid-dialog-container";

async function handleCreateChild(formData: FormData) {
  "use server";

  const cookieStore = await cookies();
  const fullName = formData.get("fullName") as string;
  const birthDate = formData.get("birthDate") as string;
  const roomId = formData.get("roomId") as string;
  const allergyTagsRaw = formData.get("allergyTags") as string;
  const medicalNotes = formData.get("medicalNotes") as string;

  const allergyTags = allergyTagsRaw
    ? allergyTagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  await createChildDb(
    { fullName, birthDate, roomId, allergyTags, medicalNotes },
    cookieStore,
  );

  revalidatePath("/kids");
}

export default async function KidsPage() {
  const cookieStore = await cookies();
  const [kids, rooms] = await Promise.all([
    fetchKids(cookieStore),
    fetchRooms(cookieStore),
  ]);

  return (
    <div className="mx-auto w-full max-w-[880px] px-10 pb-20 pt-8.5">
      <div className="mb-5.5 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#D9583C]">
            GESTIÓN
          </div>
          <h1 className="font-title text-[30px] font-semibold text-ink">
            Niños
          </h1>
        </div>
        <AddKidDialogContainer rooms={rooms} onCreateChild={handleCreateChild} />
      </div>

      <KidsBrowser kids={kids} />
    </div>
  );
}
