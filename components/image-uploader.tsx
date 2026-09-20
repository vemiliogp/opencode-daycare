"use client";

import { useRef, useState } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ImageUploaderProps {
  onFileChange: (file: File | null) => void;
}

export default function ImageUploader({ onFileChange }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      setError("La imagen no debe superar los 5MB");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    onFileChange(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
    onFileChange(null);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  if (preview) {
    return (
      <div className="flex gap-3">
        <div className="relative h-[96px] w-[96px] flex-none overflow-hidden rounded-[14px] border border-[#ECE0D0]">
          <img
            src={preview}
            alt={fileName || "Preview"}
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#3F362E]/80 text-white text-[10px] font-bold hover:bg-[#3F362E]"
            title="Quitar imagen"
          >
            ✕
          </button>
        </div>
        {error && (
          <p className="text-[12px] text-red-500 self-center">{error}</p>
        )}
      </div>
    );
  }

  return (
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
      <button
        type="button"
        onClick={handleClick}
        className="flex h-[96px] w-[96px] flex-none flex-col items-center justify-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed border-[#DBCDBA] bg-[#F4ECE1] text-[#B0A290] cursor-pointer hover:border-[#C5503A] transition-colors"
      >
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
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      {error && (
        <p className="text-[12px] text-red-500 self-center">{error}</p>
      )}
    </div>
  );
}
