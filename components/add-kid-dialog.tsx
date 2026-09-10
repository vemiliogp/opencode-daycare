"use client";

import { useState, useCallback, useEffect } from "react";
import { rooms, avatarColors, slugify, calculateAge, currentMonthYear } from "@/app/data/kids";
import type { Kid } from "@/app/data/kids";

interface AddKidDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (kid: Kid) => void;
}

function applyDateMask(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  let result = "";
  for (let i = 0; i < digits.length; i++) {
    if (i === 2 || i === 4) result += "/";
    result += digits[i];
  }
  return result;
}

export default function AddKidDialog({ open, onClose, onSave }: AddKidDialogProps) {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [room, setRoom] = useState(rooms[0]);
  const [allergies, setAllergies] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleClose = useCallback(() => {
    setName("");
    setBirthDate("");
    setRoom(rooms[0]);
    setAllergies("");
    setNotes("");
    setSubmitted(false);
    onClose();
  }, [onClose]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthDate(applyDateMask(e.target.value));
  };

  const handleSave = () => {
    setSubmitted(true);
    if (!name.trim() || !birthDate.trim() || !room) return;

    const newKid: Kid = {
      id: slugify(name.trim()),
      name: name.trim(),
      initial: name.trim().charAt(0).toUpperCase(),
      avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
      ageYears: calculateAge(birthDate),
      birthDate,
      room,
      enrollment: currentMonthYear(),
      allergyLabel: allergies.trim().toUpperCase() || undefined,
      allergyNote: notes.trim() || undefined,
      parents: [],
    };

    onSave(newKid);
    setName("");
    setBirthDate("");
    setRoom(rooms[0]);
    setAllergies("");
    setNotes("");
    setSubmitted(false);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, handleClose]);

  if (!open) return null;

  const isNameError = submitted && !name.trim();
  const isDateError = submitted && !birthDate.trim();
  const isRoomError = submitted && !room;

  const inputBase =
    "w-full rounded-[14px] border bg-white px-4 py-3.25 text-[15px] text-[#3F362E] placeholder:text-[#B6A99B]";
  const labelCls =
    "mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Agregar niño"
    >
      <div
        className="w-full max-w-[520px] rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#ECE0D0] px-6.5 py-5">
          <button
            type="button"
            className="cursor-pointer text-[15px] font-bold text-[#94887B]"
            onClick={handleClose}
          >
            Cancelar
          </button>
          <span className="font-title text-[18px] font-semibold text-[#3F362E]">
            Agregar niño
          </span>
          <button
            type="button"
            className="cursor-pointer text-[15px] font-extrabold text-[#D9583C]"
            onClick={handleSave}
          >
            Guardar
          </button>
        </div>

        <div className="px-6.5 py-6">
          <label className={labelCls}>NOMBRE COMPLETO</label>
          <input
            type="text"
            placeholder="Ej. Martina López"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${inputBase} ${isNameError ? "border-red-500" : "border-[#EADFD0]"}`}
          />

          <div className="mb-4.5 mt-4.5 flex gap-3.5">
            <div className="flex-1">
              <label className={labelCls}>FECHA DE NACIMIENTO</label>
              <input
                type="text"
                placeholder="dd/mm/aaaa"
                value={birthDate}
                onChange={handleDateChange}
                className={`${inputBase} ${isDateError ? "border-red-500" : "border-[#EADFD0]"}`}
              />
            </div>
            <div className="flex-1">
              <label className={labelCls}>SALA</label>
              <div className="relative">
                <select
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className={`${inputBase} appearance-none font-bold ${isRoomError ? "border-red-500" : "border-[#EADFD0]"}`}
                >
                  {rooms.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#B0A290"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <label className={labelCls}>ALERGIAS (ETIQUETAS)</label>
          <input
            type="text"
            placeholder="Ej. Maní, Lactosa"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            className={`${inputBase} border-[#EADFD0] mb-4.5`}
          />

          <label className={labelCls}>NOTAS MÉDICAS</label>
          <textarea
            placeholder="Indicaciones, medicación, contactos…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={`${inputBase} border-[#EADFD0] resize-none`}
            style={{ lineHeight: 1.5 }}
          />
        </div>
      </div>
    </div>
  );
}
