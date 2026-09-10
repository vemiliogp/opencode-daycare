import { kids, type Kid } from "@/app/data/kids";
import Link from "next/link";
import { notFound } from "next/navigation";
import LinkedParentsCard from "@/components/linked-parents-card";

const avatarColors: Record<Kid["avatarColor"], { bg: string; text: string }> = {
  sky: { bg: "#A9D9E8", text: "#1F7A93" },
  pink: { bg: "#F4B8CC", text: "#C44A7A" },
  green: { bg: "#B9DEC4", text: "#3E8B62" },
  yellow: { bg: "#F4DC8E", text: "#9A7B1E" },
  purple: { bg: "#C9B6E8", text: "#7B5FC0" },
  periwinkle: { bg: "#A9C7E8", text: "#fff" },
};

function BackArrow() {
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

function SunSmall() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4.5 py-3.75">
      <span className="text-[14.5px] text-muted-strong">{label}</span>
      <span className="text-[14.5px] font-extrabold text-ink">{value}</span>
    </div>
  );
}

export default async function KidProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kid = kids.find((k) => k.id === id);
  if (!kid) notFound();

  const colors = avatarColors[kid.avatarColor];

  return (
    <div className="mx-auto w-full max-w-[820px] px-10 pb-20 pt-8.5">
      <Link
        href="/kids"
        className="mb-5 flex items-center gap-1.75 text-[14px] font-bold text-muted-strong"
      >
        <BackArrow />
        Volver a Niños
      </Link>

      <div className="flex flex-col items-start gap-6.5 lg:flex-row lg:items-start">
        {/* Left column */}
        <div className="flex min-w-[300px] flex-1 flex-col gap-4.5">
          {/* Header */}
          <div className="flex items-center gap-4.5">
            <div
              className="flex h-[84px] w-[84px] flex-none items-center justify-center rounded-full font-title text-[34px] font-semibold"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {kid.initial}
            </div>
            <div className="flex-1">
              <h1 className="m-0 font-title text-[28px] font-semibold text-ink">
                {kid.name}
              </h1>
              <p className="mt-0.75 text-[15px] text-muted-strong">
                {kid.ageYears} años · Sala {kid.room}
              </p>
            </div>
            <a
              href="#"
              className="rounded-xl border border-[1.5px] border-border bg-surface px-4 py-2.25 text-[14px] font-bold text-[#6E6359]"
            >
              Editar
            </a>
          </div>

          {/* Allergies card - conditional */}
          {kid.allergyNote && (
            <div className="flex gap-3.5 rounded-2xl bg-[#FBDAD6] p-4.5">
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[#F4A8A0]">
                <WarningIcon />
              </div>
              <div>
                <div className="mb-0.5 text-[15px] font-extrabold text-[#C5413A]">
                  Alergias y notas
                </div>
                <div className="text-[14.5px] leading-relaxed text-[#B25249]">
                  {kid.allergyNote}
                </div>
              </div>
            </div>
          )}

          {/* Data card */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface">
            <DataRow label="Fecha de nacimiento" value={kid.birthDate} />
            <div className="border-t border-divider" />
            <DataRow label="Sala" value={kid.room} />
            <div className="border-t border-divider" />
            <DataRow label="Ingreso" value={kid.enrollment} />
          </div>
        </div>

        {/* Right column */}
        <div className="w-[300px] flex-none lg:flex-none">
          <div className="flex flex-col gap-3.5">
            <a
              href="#"
              className="flex w-full items-center justify-center gap-2.25 rounded-[14px] bg-ink p-3.25 text-[15px] font-extrabold text-white"
            >
              <SunSmall />
              Resumen del día
            </a>

            <LinkedParentsCard kidName={kid.name} parents={kid.parents} />
          </div>
        </div>
      </div>
    </div>
  );
}
