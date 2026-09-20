import { type Kid } from "@/app/data/kids";
import Link from "next/link";

const avatarColors: Record<Kid["avatarColor"], { bg: string; text: string }> = {
  sky: { bg: "#A9D9E8", text: "#1F7A93" },
  pink: { bg: "#F4B8CC", text: "#C44A7A" },
  green: { bg: "#B9DEC4", text: "#3E8B62" },
  yellow: { bg: "#F4DC8E", text: "#9A7B1E" },
  purple: { bg: "#C9B6E8", text: "#7B5FC0" },
  periwinkle: { bg: "#A9C7E8", text: "#fff" },
};

function ChevronRight() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#CBB89F"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function getParentSubtitle(count: number) {
  if (count === 0) return "sin padres vinculados";
  if (count === 1) return "1 padre vinculado";
  return `${count} padres vinculados`;
}

function getRightElement(allergyLabel: string | undefined, parentsCount: number) {
  if (allergyLabel) {
    return (
      <span className="rounded-full bg-[#FBD8CC] px-2.25 py-1.25 text-[11px] font-extrabold text-[#D9684A]">
        {allergyLabel}
      </span>
    );
  }
  if (parentsCount === 0) {
    return (
      <span className="rounded-full bg-[#F9D2DE] px-2.25 py-1.25 text-[11px] font-extrabold text-[#C56486]">
        VINCULAR
      </span>
    );
  }
  return <ChevronRight />;
}

interface KidCardProps {
  kid: Kid;
  mode?: "staff" | "family";
}

export default function KidCard({ kid, mode = "staff" }: KidCardProps) {
  const colors = avatarColors[kid.avatarColor];
  const content = (
    <>
      <div
        className="flex h-12 w-12 flex-none items-center justify-center rounded-full font-title text-[19px] font-semibold"
        style={{ backgroundColor: colors.bg, color: colors.text }}
        aria-hidden="true"
      >
        {kid.initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-title text-[16px] font-semibold text-ink">
          {kid.name}
        </div>
        <div className="text-[13px] text-muted">
          {kid.ageYears} años · {getParentSubtitle(kid.parents.length)}
        </div>
      </div>
      {getRightElement(kid.allergyLabel, kid.parents.length)}
    </>
  );

  if (mode === "family") {
    return (
      <div
        className="flex min-w-0 items-center gap-3.5 rounded-[18px] border border-border bg-surface p-4 shadow-[0_4px_14px_-12px_rgba(120,90,60,0.5)]"
        aria-label={`${kid.name}, ${kid.ageYears} años`}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/kids/${kid.id}`}
      className="flex min-w-0 items-center gap-3.5 rounded-[18px] border border-border bg-surface p-4 shadow-[0_4px_14px_-12px_rgba(120,90,60,0.5)] transition-[.15s] hover:border-[#F2A78E] hover:-translate-y-0.5"
      aria-label={`${kid.name}, ${kid.ageYears} años`}
    >
      {content}
    </Link>
  );
}
