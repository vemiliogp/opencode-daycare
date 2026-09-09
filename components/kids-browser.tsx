"use client";

import { useState } from "react";
import { type Kid } from "@/app/data/kids";
import KidCard from "@/components/kid-card";

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#B0A290"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export default function KidsBrowser({ kids }: { kids: Kid[] }) {
  const [query, setQuery] = useState("");

  const filtered = kids.filter((k) =>
    k.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div className="mb-5.5 flex items-center gap-2.75 rounded-[14px] border border-border bg-surface p-3.5">
        <SearchIcon />
        <input
          placeholder="Buscar niño…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border-none bg-none text-[15px] text-ink placeholder-muted focus:outline-none"
        />
      </div>
      <div className="mb-3.5 flex items-center gap-3">
        <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-ink">
          SALA SOLES
        </span>
        <span className="text-[13px] text-muted">
          {filtered.length} {filtered.length === 1 ? "niño" : "niños"}
        </span>
        <span className="flex-1 h-px bg-[#E7DAC8]" />
      </div>

      {filtered.length === 0 ? (
        <div className="py-10 text-center text-[15px] text-muted-strong">
          No se encontraron resultados para &ldquo;{query}&rdquo;
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
          {filtered.map((kid) => (
            <KidCard key={kid.id} kid={kid} />
          ))}
        </div>
      )}
    </>
  );
}
