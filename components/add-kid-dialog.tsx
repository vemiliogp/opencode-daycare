"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { avatarColors, slugify, calculateAge, currentMonthYear } from "@/app/data/kids";
import type { Kid } from "@/app/data/kids";

type RoomOption = { id: string; name: string };

interface AddKidDialogProps {
  open: boolean;
  onClose: () => void;
  rooms?: RoomOption[];
  onSaveKid?: (kid: Kid) => void;
  onSaveKidDetails?: (
    fullName: string,
    birthDate: string,
    roomId: string,
    allergyTags: string[],
    medicalNotes: string,
  ) => void;
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

function isValidDateFormat(date: string): boolean {
  const match = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;

  const [, dayStr, monthStr, yearStr] = match;
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  const year = parseInt(yearStr, 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return false;

  const inputDate = new Date(year, month - 1, day);
  const now = new Date();
  if (inputDate > now) return false;

  return true;
}

function isRoomOptionArray(
  rooms: string[] | RoomOption[] | undefined,
): rooms is RoomOption[] {
  return (
    Array.isArray(rooms) &&
    rooms.length > 0 &&
    typeof rooms[0] === "object" &&
    "id" in rooms[0]
  );
}

function getRoomNames(rooms: string[] | RoomOption[] | undefined): string[] {
  if (!rooms) return [];
  if (isRoomOptionArray(rooms)) return rooms.map((r) => r.name);
  return rooms;
}

export default function AddKidDialog({
  open,
  onClose,
  rooms: roomsProp,
  onSaveKid,
  onSaveKidDetails,
}: AddKidDialogProps) {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(0);
  const [allergies, setAllergies] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const dialogContentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const roomNames = getRoomNames(roomsProp);
  const roomOptions = isRoomOptionArray(roomsProp) ? roomsProp : [];

  const handleClose = useCallback(() => {
    setName("");
    setBirthDate("");
    setSelectedRoom(0);
    setAllergies("");
    setNotes("");
    setSubmitted(false);
    // Restore focus to the element that was focused before the dialog opened
    previousFocusRef.current?.focus();
    onClose();
  }, [onClose]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthDate(applyDateMask(e.target.value));
  };

  const handleSave = () => {
    setSubmitted(true);
    if (
      !name.trim() ||
      !birthDate.trim() ||
      roomNames.length === 0 ||
      !isValidDateFormat(birthDate)
    )
      return;

    if (roomOptions.length > 0) {
      const roomId = roomOptions[selectedRoom]?.id;
      if (!roomId || !onSaveKidDetails) return;

      const allergyTags = allergies
        .trim()
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      onSaveKidDetails(name.trim(), birthDate, roomId, allergyTags, notes.trim());
    } else {
      if (!onSaveKid) return;

      const newKid: Kid = {
        id: slugify(name.trim()),
        name: name.trim(),
        initial: name.trim().charAt(0).toUpperCase(),
        avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
        ageYears: calculateAge(birthDate),
        birthDate,
        room: roomNames[selectedRoom] || "",
        enrollment: currentMonthYear(),
        allergyLabel: allergies.trim().toUpperCase() || undefined,
        allergyNote: notes.trim() || undefined,
        parents: [],
      };

      onSaveKid(newKid);
    }

    setName("");
    setBirthDate("");
    setSelectedRoom(0);
    setAllergies("");
    setNotes("");
    setSubmitted(false);
  };

  // Capture the previously focused element when the dialog opens
  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [open]);

  // Only register the Escape key listener while the dialog is open
  useEffect(() => {
    if (!open) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, handleClose]);

  // Focus the dialog content when it opens
  useEffect(() => {
    if (open) {
      dialogContentRef.current?.focus();
    }
  }, [open]);

  if (!open) return null;

  const isNameError = submitted && !name.trim();
  const isDateError =
    submitted && (!birthDate.trim() || !isValidDateFormat(birthDate));
  const isRoomError = submitted && roomNames.length === 0;

  const inputBase =
    "w-full rounded-[14px] border bg-white px-4 py-3.25 text-[15px] text-[#3F362E] placeholder:text-[#B6A99B]";
  const labelCls =
    "mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-kid-dialog-title"
    >
      <div
        ref={dialogContentRef}
        tabIndex={-1}
        className="w-full max-w-[520px] rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)] outline-none"
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
          <span
            id="add-kid-dialog-title"
            className="font-title text-[18px] font-semibold text-[#3F362E]"
          >
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
          <label htmlFor="kid-name" className={labelCls}>
            NOMBRE COMPLETO
          </label>
          <input
            id="kid-name"
            type="text"
            placeholder="Ej. Martina López"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${inputBase} ${isNameError ? "border-red-500" : "border-[#EADFD0]"}`}
            aria-invalid={isNameError}
            aria-describedby={isNameError ? "kid-name-error" : undefined}
          />
          {isNameError && (
            <p id="kid-name-error" className="mt-1 text-sm text-red-500" role="alert">
              El nombre es obligatorio
            </p>
          )}

          <div className="mb-4.5 mt-4.5 flex gap-3.5">
            <div className="flex-1">
              <label htmlFor="kid-birthdate" className={labelCls}>
                FECHA DE NACIMIENTO
              </label>
              <input
                id="kid-birthdate"
                type="text"
                placeholder="dd/mm/aaaa"
                value={birthDate}
                onChange={handleDateChange}
                className={`${inputBase} ${isDateError ? "border-red-500" : "border-[#EADFD0]"}`}
                aria-invalid={isDateError}
                aria-describedby={isDateError ? "kid-birthdate-error" : undefined}
              />
              {isDateError && (
                <p
                  id="kid-birthdate-error"
                  className="mt-1 text-sm text-red-500"
                  role="alert"
                >
                  Ingresa una fecha válida (dd/mm/aaaa)
                </p>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="kid-room" className={labelCls}>
                SALA
              </label>
              <div className="relative">
                <select
                  id="kid-room"
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(Number(e.target.value))}
                  className={`${inputBase} appearance-none font-bold ${isRoomError ? "border-red-500" : "border-[#EADFD0]"}`}
                  aria-invalid={isRoomError}
                >
                  {roomNames.map((r, i) => (
                    <option key={r} value={i}>
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

          <label htmlFor="kid-allergies" className={labelCls}>
            ALERGIAS (ETIQUETAS)
          </label>
          <input
            id="kid-allergies"
            type="text"
            placeholder="Ej. Maní, Lactosa"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            className={`${inputBase} border-[#EADFD0] mb-4.5`}
          />

          <label htmlFor="kid-notes" className={labelCls}>
            NOTAS MÉDICAS
          </label>
          <textarea
            id="kid-notes"
            placeholder="Indicaciones, medicación, contactos…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={`${inputBase} border-[#EADFD0] resize-none`}
            style={{ lineHeight: 1.5 }}
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
