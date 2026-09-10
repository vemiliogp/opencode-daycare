import { kids } from "@/app/data/kids";
import KidsBrowser from "@/components/kids-browser";

export default function KidsPage() {
  return (
    <div className="mx-auto w-full max-w-[880px] px-10 pb-20 pt-8.5">
      <div className="mb-5.5 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#D9583C]">
            GESTIÓN
          </div>
          <h1 className="font-title text-[30px] font-semibold text-ink">
            Niños
          </h1>
        </div>
        <a
          href="#"
          className="flex items-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-4.5 py-2.75 text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.7)]"
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Agregar niño
        </a>
      </div>

      <KidsBrowser kids={kids} />
    </div>
  );
}
