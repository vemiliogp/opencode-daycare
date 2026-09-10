"use client";

import { useState } from "react";
import type { Parent } from "@/app/data/kids";
import LinkParentDialog from "@/components/link-parent-dialog";

const parentAvatarColors: Record<Parent["role"], { bg: string; text: string }> = {
  mother: { bg: "#C9B6E8", text: "#fff" },
  father: { bg: "#A9C7E8", text: "#fff" },
  tutor: { bg: "#F4B8CC", text: "#fff" },
};

function PlusSmall() {
  return (
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
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function roleLabel(role: Parent["role"]) {
  if (role === "mother") return "Mamá";
  if (role === "father") return "Papá";
  return "Tutor/a";
}

function statusInfo(status: Parent["status"]) {
  if (status === "active") {
    return { badge: "ACTIVA", bg: "#CFEBD8", text: "#3E9B6C", subtitle: "activa" };
  }
  return { badge: "PENDIENTE", bg: "#F7E7A6", text: "#9A7B1E", subtitle: "invitación enviada" };
}

interface LinkedParentsCardProps {
  kidName: string;
  parents: Parent[];
}

export default function LinkedParentsCard({
  kidName,
  parents: initialParents,
}: LinkedParentsCardProps) {
  const [parents, setParents] = useState<Parent[]>(initialParents);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSend = (parent: Parent) => {
    setParents((prev) => [...prev, parent]);
    setDialogOpen(false);
  };

  return (
    <>
      <div className="rounded-2xl border border-border bg-surface p-4.5">
        <div className="mb-3.5 text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D]">
          PADRES VINCULADOS
        </div>
        <div className="flex flex-col gap-3.5">
          {parents.map((parent) => {
            const pColors = parentAvatarColors[parent.role];
            const sInfo = statusInfo(parent.status);
            return (
              <div key={parent.name} className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-full font-title text-[16px] font-semibold"
                  style={{ backgroundColor: pColors.bg, color: pColors.text }}
                >
                  {parent.initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14.5px] font-extrabold text-ink">
                    {parent.name}
                  </div>
                  <div className="text-[12.5px] text-muted">
                    {roleLabel(parent.role)} · {sInfo.subtitle}
                  </div>
                </div>
                <span
                  className="rounded-full px-2.25 py-1 text-[10.5px] font-extrabold"
                  style={{ backgroundColor: sInfo.bg, color: sInfo.text }}
                >
                  {sInfo.badge}
                </span>
              </div>
            );
          })}

          <button
            type="button"
            className="flex cursor-pointer items-center gap-3 bg-none pt-2"
            onClick={() => setDialogOpen(true)}
          >
            <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border-[1.5px] border-dashed border-[#D8CBBA] text-[#B0A290]">
              <PlusSmall />
            </span>
            <span className="text-[14.5px] font-extrabold text-[#C5503A]">
              Vincular otro padre
            </span>
          </button>
        </div>
      </div>

      <LinkParentDialog
        open={dialogOpen}
        kidName={kidName}
        onClose={() => setDialogOpen(false)}
        onSend={handleSend}
      />
    </>
  );
}
