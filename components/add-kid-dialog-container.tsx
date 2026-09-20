"use client";

import { useState } from "react";
import AddKidDialog from "@/components/add-kid-dialog";

interface AddKidDialogContainerProps {
  rooms: { id: string; name: string }[];
  onCreateChild: (formData: FormData) => Promise<void>;
}

export default function AddKidDialogContainer({
  rooms,
  onCreateChild,
}: AddKidDialogContainerProps) {
  const [open, setOpen] = useState(false);

  const handleSave = (
    fullName: string,
    birthDate: string,
    roomId: string,
    allergyTags: string[],
    medicalNotes: string,
  ) => {
    const formData = new FormData();
    formData.set("fullName", fullName);
    formData.set("birthDate", birthDate);
    formData.set("roomId", roomId);
    formData.set("allergyTags", allergyTags.join(","));
    formData.set("medicalNotes", medicalNotes);
    onCreateChild(formData);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer flex items-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-4.5 py-2.75 text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.7)]"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
        Agregar niño
      </button>

      <AddKidDialog
        open={open}
        onClose={() => setOpen(false)}
        rooms={rooms}
        onSaveKidDetails={handleSave}
      />
    </>
  );
}
