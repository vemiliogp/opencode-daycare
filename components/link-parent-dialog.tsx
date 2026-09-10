"use client";

import { useState, useCallback, useEffect } from "react";
import type { Parent, ParentRole } from "@/app/data/kids";

interface LinkParentDialogProps {
  open: boolean;
  kidName: string;
  onClose: () => void;
  onSend: (parent: Parent) => void;
}

const roleOptions: { value: ParentRole; label: string }[] = [
  { value: "mother", label: "Mamá" },
  { value: "father", label: "Papá" },
  { value: "tutor", label: "Tutor/a" },
];

export default function LinkParentDialog({
  open,
  kidName,
  onClose,
  onSend,
}: LinkParentDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ParentRole>("mother");
  const [submitted, setSubmitted] = useState(false);

  const handleClose = useCallback(() => {
    setName("");
    setEmail("");
    setRole("mother");
    setSubmitted(false);
    onClose();
  }, [onClose]);

  const handleSend = () => {
    setSubmitted(true);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedName || !trimmedEmail || !emailRegex.test(trimmedEmail)) return;

    onSend({
      name: trimmedName,
      initial: trimmedName.charAt(0).toUpperCase(),
      role,
      status: "pending",
    });
    setName("");
    setEmail("");
    setRole("mother");
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

  const firstName = kidName.split(" ")[0];
  const isNameError = submitted && !name.trim();
  const isEmailError =
    submitted && (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));

  const labelCls =
    "mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]";
  const inputBase =
    "w-full rounded-[14px] border bg-white px-4 py-3.25 text-[15px] text-[#3F362E] placeholder:text-[#B6A99B]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Vincular padre"
    >
      <div
        className="w-full max-w-[480px] rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ECE0D0] px-6.5 py-5">
          <div>
            <div className="font-title text-[18px] font-semibold text-[#3F362E]">
              Vincular padre
            </div>
            <div className="text-[13px] text-[#A89A8B]">a {kidName}</div>
          </div>
          <button
            type="button"
            className="flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[10px] bg-[#F0E6D8] text-[#94887B]"
            onClick={handleClose}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6.5 py-[22px]">
          {/* Banner */}
          <div className="mb-5 flex gap-[11px] rounded-[14px] bg-[#E3ECFB] p-[13px] pr-4">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4E72C8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 flex-none"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <span className="text-[13.5px] leading-[1.45] text-[#3F5694]">
              Le enviaremos un correo con un código para que active su cuenta. Solo verá el feed de {firstName}.
            </span>
          </div>

          {/* Name field */}
          <label className={labelCls}>NOMBRE DEL PADRE/MADRE</label>
          <input
            type="text"
            placeholder="Ej. Diego Fernández"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${inputBase} mb-[18px] ${isNameError ? "border-red-500" : "border-[#EADFD0]"}`}
          />

          {/* Email field */}
          <label className={labelCls}>EMAIL</label>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${inputBase} mb-[18px] ${isEmailError ? "border-red-500" : "border-[#EADFD0]"}`}
          />

          {/* Pills */}
          <label className={labelCls}>PARENTESCO</label>
          <div className="mb-5 flex gap-[9px]">
            {roleOptions.map((opt) => {
              const active = role === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className="cursor-pointer flex-1 rounded-full px-3 py-[11px] text-[14px] font-extrabold"
                  style={
                    active
                      ? {
                          border: "1.5px solid #9FB8EC",
                          background: "#CCD8F4",
                          color: "#4E72C8",
                        }
                      : {
                          border: "1.5px solid #ECE0D0",
                          background: "#FFFDF9",
                          color: "#6E6359",
                        }
                  }
                  onClick={() => setRole(opt.value)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Invitation code */}
          <div className="mb-5 rounded-[16px] border-[1.5px] border-dashed border-[#E6D08A] bg-[#FBF1D6] p-[18px] text-center">
            <div className="mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#A88526]">
              CÓDIGO DE INVITACIÓN
            </div>
            <div className="font-title text-[34px] font-semibold tracking-[7px] text-[#8A7234]">
              7K4P9
            </div>
            <div className="mt-1.5 text-[13px] text-[#A88526]">Vence en 7 días</div>
          </div>

          {/* CTA */}
          <button
            type="button"
            className="flex w-full cursor-pointer items-center justify-center gap-2.25 rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] py-3.5 text-[15.5px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]"
            onClick={handleSend}
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m22 2-7 20-4-9-9-4z" />
              <path d="M22 2 11 13" />
            </svg>
            Enviar invitación
          </button>
        </div>
      </div>
    </div>
  );
}
