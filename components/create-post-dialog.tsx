"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { kids, slugify } from "@/app/data/kids";
import { postKindOptions, type PostKind, type Post } from "@/app/data/feed";
import { useFeedActions } from "@/components/feed-provider";
import type { Kid } from "@/app/data/kids";
import MarkdownToolbar from "@/components/markdown-toolbar";
import ImageUploader from "@/components/image-uploader";
import { createPost } from "@/lib/actions/create-post";
import { getUserContext } from "@/lib/actions/get-user-context";

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
    const { postDialogOpen, closePostDialog, addPost } = useFeedActions();

  const [selectedKidIds, setSelectedKidIds] = useState<string[]>([]);
  const [wholeRoom, setWholeRoom] = useState(false);
  const [kind, setKind] = useState<PostKind | null>(null);
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleClose = useCallback(() => {
    setSelectedKidIds([]);
    setWholeRoom(false);
    setKind(null);
    setDescription("");
    setSubmitted(false);
    setPending(false);
    setErrorMsg(null);
    setImageFile(null);
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

  const handlePublish = async () => {
    setSubmitted(true);
    const hasRecipient = selectedKidIds.length > 0 || wholeRoom;
    if (!hasRecipient || !kind || !description.trim()) return;

    setPending(true);
    setErrorMsg(null);

    const userCtx = await getUserContext();
    const daycareId = userCtx.success && userCtx.user?.daycareId
      ? userCtx.user.daycareId
      : "mock-daycare";
    const authorId = userCtx.success && userCtx.user?.id
      ? userCtx.user.id
      : "mock-author";

    const audienceType = wholeRoom ? "room" as const : "child" as const;
    const audienceChildIds = wholeRoom ? undefined : selectedKidIds;

    const result = await createPost({
      daycareId,
      authorId,
      kind,
      body: description.trim(),
      imageFile: imageFile || undefined,
      audienceType,
      audienceChildIds,
    });

    if (!result.success) {
      setErrorMsg(result.error || "Error al crear la publicación");
      setPending(false);
      return;
    }

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
      id: result.postId || `${slugify(authorName)}-${Date.now()}`,
      kind,
      authorName,
      authorInitial,
      time: formatTime(new Date()),
      publishedByYou: true,
      audience,
      body: description.trim(),
      photoCaption: result.imageUrl ? "Foto" : undefined,
      imageUrl: result.imageUrl,
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
            className={`cursor-pointer text-[15px] font-extrabold text-[#D9583C] ${pending ? "opacity-50 pointer-events-none" : ""}`}
            onClick={handlePublish}
            disabled={pending}
          >
            {pending ? "Publicando…" : "Publicar"}
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
          <MarkdownToolbar
            textareaRef={textareaRef}
            value={description}
            onChange={setDescription}
          />
          <textarea
            ref={textareaRef}
            placeholder="Contá cómo le fue hoy…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`mb-2 w-full rounded-[14px] border-[1.5px] bg-white px-4 py-3.5 text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] ${descError ? "border-red-500" : "border-[#EADFD0]"}`}
            style={{ minHeight: 120, resize: "vertical", lineHeight: 1.5 }}
          />
          {errorMsg && (
            <p className="mb-3 text-[13px] text-red-500">{errorMsg}</p>
          )}

          <div className={labelCls}>FOTOS</div>
          <ImageUploader onFileChange={setImageFile} />
        </div>
      </div>
    </div>
  );
}
