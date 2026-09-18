"use client";

import { useState } from "react";
import { reinviteParent } from "@/lib/actions/reinvite-parent";
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
  childId: string;
  parents: Parent[];
}

export default function LinkedParentsCard({
  kidName,
  childId,
  parents: initialParents,
}: LinkedParentsCardProps) {
  const [parents, setParents] = useState<Parent[]>(initialParents);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reinviteLoading, setReinviteLoading] = useState<string | null>(null);
  const [reinviteSuccess, setReinviteSuccess] = useState<string | null>(null);

  const handleSend = (parent: Parent) => {
    setParents((prev) => [...prev, parent]);
    setDialogOpen(false);
  };

  const handleReinvite = async (parent: Parent) => {
    if (!parent.email) return;
    setReinviteLoading(parent.name);
    setReinviteSuccess(null);
    const result = await reinviteParent({
      childId,
      parentEmail: parent.email,
      parentName: parent.name,
    });
    setReinviteLoading(null);
    if (result.success) {
      setReinviteSuccess(parent.name);
      setTimeout(() => setReinviteSuccess(null), 3000);
    }
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
            const isPending = parent.status === "pending";
            const isLoading = reinviteLoading === parent.name;
            const isSuccess = reinviteSuccess === parent.name;
            return (
              <div key={parent.name} className="flex items-start gap-3">
                <div
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-full font-title text-[16px] font-semibold"
                  style={{ backgroundColor: pColors.bg, color: pColors.text }}
                >
                  {parent.initial}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[15px] font-extrabold text-ink">
                        {parent.name}
                      </div>
                      <div className="text-[12.5px] text-muted">
                        {roleLabel(parent.role)}
                      </div>
                    </div>
                    {isPending && parent.email && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleReinvite(parent)}
                        className={`flex flex-none cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold ${isLoading ? "opacity-60" : ""}`}
                        style={{
                          border: "1.5px solid #D8CBBA",
                          background: isSuccess ? "#CFEBD8" : "#FFFDF9",
                          color: isSuccess ? "#3E9B6C" : "#6E6359",
                        }}
                      >
                        {isLoading ? (
                          <>
                            <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Reenviando
                          </>
                        ) : isSuccess ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                            Reenviado
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m22 2-7 20-4-9-9-4z" />
                              <path d="M22 2 11 13" />
                            </svg>
                            Reenviar
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  {isPending && (
                    <div className="flex items-center gap-1.5">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-[0.3px]"
                        style={{ backgroundColor: sInfo.bg, color: sInfo.text }}
                      >
                        {sInfo.badge}
                      </span>
                      <span className="text-[11px] text-muted">
                        {sInfo.subtitle}
                      </span>
                    </div>
                  )}
                </div>
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
        childId={childId}
        onClose={() => setDialogOpen(false)}
        onSend={handleSend}
      />
    </>
  );
}
