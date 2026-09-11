"use client";

import { useState, useCallback, useEffect } from "react";
import { kids, slugify } from "@/app/data/kids";
import { postKindOptions, type PostKind, type Post } from "@/app/data/feed";
import { useFeed } from "@/components/feed-provider";
import type { Kid } from "@/app/data/kids";

const avatarColorMap: Record<Kid["avatarColor"], { bg: string; text: string }> = {
  sky: { bg: "#A9D9E8", text: "#1F7A93" },
  pink: { bg: "#F4B8CC", text: "#C44A7A" },
  green: { bg: "#B9DEC4", text: "#3E8B62" },
  yellow: { bg: "#F4DC8E", text: "#9A7B1E" },
  purple: { bg: "#C9B6E8", text: "#7B5FC0" },
  periwinkle: { bg: "#A9C7E8", text: "#fff" },
};

const kindActiveStyles: Record<PostKind, { bg: string; text: string }> = {
  food: { bg: "#9A7B1E", text: "#fff" },
  nap: { bg: "#E7DCF6", text: "#7B5FC0" },
  activity: { bg: "#2E89A6", text: "#fff" },
  achievement: { bg: "#CFEBD8", text: "#3E9B6C" },
  mood: { bg: "#F9D2DE", text: "#C56486" },
  photo: { bg: "#FBD8CC", text: "#D9684A" },
  announcement: { bg: "#CCD8F4", text: "#4E72C8" },
};

const solesKids = kids.filter((k) => k.room === "Soles");

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export default function CreatePostDialog() {
  const { postDialogOpen, closePostDialog, addPost } = useFeed();

  const [selectedKidIds, setSelectedKidIds] = useState<string[]>([]);
  const [wholeRoom, setWholeRoom] = useState(false);
  const [kind, setKind] = useState<PostKind | null>(null);
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleClose = useCallback(() => {
    setSelectedKidIds([]);
    setWholeRoom(false);
    setKind(null);
    setDescription("");
    setSubmitted(false);
    closePostDialog();
  }, [closePostDialog]);

  const handleKidToggle = (kidId: string) => {
    setWholeRoom(false);
    setSelectedKidIds((prev) =>
      prev.includes(kidId)
        ? prev.filter((id) => id !== kidId)
        : [...prev, kidId],
    );
  };

  const handleWholeRoomToggle = () => {
    setSelectedKidIds([]);
    setWholeRoom(true);
  };

  const handlePublish = () => {
    setSubmitted(true);
    const hasRecipient = selectedKidIds.length > 0 || wholeRoom;
    if (!hasRecipient || !kind || !description.trim()) return;

    const selectedKids = solesKids.filter((k) => selectedKidIds.includes(k.id));
    let authorName: string;
    let authorInitial: string;
    let audience: string;

    if (wholeRoom) {
      authorName = "Anuncio general";
      authorInitial = "";
      audience = "Para: toda la sala";
    } else if (selectedKids.length === 1) {
      const firstName = selectedKids[0].name.split(" ")[0];
      authorName = firstName;
      authorInitial = selectedKids[0].initial;
      audience = `Para: familia de ${firstName}`;
    } else {
      const firstNames = selectedKids.map((k) => k.name.split(" ")[0]);
      authorName = firstNames.join(" y ");
      authorInitial = selectedKids[0].initial;
      audience = `Para: familias de ${firstNames.join(" y ")}`;
    }

    const newPost: Post = {
      id: `${slugify(authorName)}-${Date.now()}`,
      kind,
      authorName,
      authorInitial,
      time: formatTime(new Date()),
      publishedByYou: true,
      audience,
      body: description.trim(),
      hearts: 0,
      comments: 0,
    };

    addPost(newPost);
    handleClose();
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && postDialogOpen) handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [postDialogOpen, handleClose]);

  if (!postDialogOpen) return null;

  const labelCls =
    "mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]";

  const chipBase =
    "flex items-center gap-2 rounded-full border-[1.5px] px-3.5 py-1.5 text-[14px] font-bold cursor-pointer";
  const chipActive =
    "border-[#3F362E] bg-[#3F362E] text-white";
  const chipInactive =
    "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]";

  const pillBase =
    "rounded-full px-4 py-2 text-[13.5px] font-extrabold cursor-pointer";
  const pillInactive =
    "border border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]";

  const hasRecipient = selectedKidIds.length > 0 || wholeRoom;
  const hasKind = kind !== null;
  const hasDescription = description.trim().length > 0;

  const paraError = submitted && !hasRecipient;
  const tipoError = submitted && !hasKind;
  const descError = submitted && !hasDescription;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-6"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Nueva publicación"
    >
      <div
        className="my-8 w-full max-w-[580px] rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]"
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
            Nueva publicación
          </span>
          <button
            type="button"
            className="cursor-pointer text-[15px] font-extrabold text-[#D9583C]"
            onClick={handlePublish}
          >
            Publicar
          </button>
        </div>

        <div className="px-6.5 py-6">
          <div className={labelCls}>PARA</div>
          <div className="mb-5.5 flex flex-wrap gap-2.25">
            {solesKids.map((kid) => {
              const isSelected = selectedKidIds.includes(kid.id);
              const colors = avatarColorMap[kid.avatarColor];
              return (
                <button
                  key={kid.id}
                  type="button"
                  className={`${chipBase} ${isSelected ? chipActive : chipInactive} ${paraError ? "!border-red-500" : ""}`}
                  onClick={() => handleKidToggle(kid.id)}
                >
                  <span
                    className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full font-title text-[13px] font-semibold"
                    style={{ backgroundColor: colors.bg, color: colors.text }}
                  >
                    {kid.initial}
                  </span>
                  {kid.name.split(" ")[0]}
                </button>
              );
            })}
            <button
              type="button"
              className={`${chipBase} ${wholeRoom ? chipActive : chipInactive} px-4 ${paraError ? "!border-red-500" : ""}`}
              onClick={handleWholeRoomToggle}
            >
              Toda la sala
            </button>
          </div>

          <div className={labelCls}>TIPO</div>
          <div className="mb-5.5 flex flex-wrap gap-2.25">
            {postKindOptions.map((opt) => {
              const isActive = kind === opt.value;
              const active = kindActiveStyles[opt.value];
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={`${pillBase} ${isActive ? "" : pillInactive} ${tipoError ? "!border-red-500" : ""}`}
                  style={
                    isActive
                      ? { backgroundColor: active.bg, color: active.text }
                      : undefined
                  }
                  onClick={() => setKind(opt.value)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className={labelCls}>DESCRIPCIÓN</div>
          <textarea
            placeholder="Contá cómo le fue hoy…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`mb-5.5 w-full rounded-[14px] border-[1.5px] bg-white px-4 py-3.5 text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] ${descError ? "border-red-500" : "border-[#EADFD0]"}`}
            style={{ minHeight: 120, resize: "vertical", lineHeight: 1.5 }}
          />

          <div className={labelCls}>FOTOS</div>
          <div className="flex gap-3">
            <div className="flex h-[96px] w-[96px] flex-none items-center justify-center rounded-[14px] border border-[#ECE0D0] bg-[#F4ECE1] text-[#CBB89F]">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 21" />
              </svg>
            </div>
            <div className="flex h-[96px] w-[96px] flex-none flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[#DBCDBA] bg-[#F4ECE1] text-[#B0A290] cursor-pointer">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C5503A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-[12px]">Agregar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
