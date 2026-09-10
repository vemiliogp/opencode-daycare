import { feedData } from "@/app/data/feed";
import PostCard from "@/components/post-card";

function CameraMark() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-[760px] px-10 pb-20 pt-8.5">
      <header className="mb-6">
        <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#D9583C]">
          GUARDERÍA · SALA SOLES
        </div>
        <h1 className="font-title text-[30px] font-semibold text-ink">
          {feedData.greeting}
        </h1>
        <p className="mt-1.25 text-[14.5px] text-muted-strong">{feedData.meta}</p>
      </header>

      <a
        href="#"
        className="mb-6 flex items-center gap-3.5 rounded-[18px] border border-border bg-surface px-4.5 py-3.5 shadow-[0_4px_14px_-10px_rgba(120,90,60,0.4)]"
      >
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#F2937A] font-title text-[16px] font-semibold text-white">
          C
        </div>
        <span className="flex-1 text-[15px] text-muted">Compartí un momento…</span>
        <span className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-[#FBE3D8] text-[#E0654A]">
          <CameraMark />
        </span>
      </a>

      <div className="mb-3.5 flex items-center gap-3.5">
        <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D]">
          PUBLICADO HOY
        </span>
        <span className="h-px flex-1 bg-[#E7DAC8]" />
      </div>

      <div className="flex flex-col gap-4">
        {feedData.posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
