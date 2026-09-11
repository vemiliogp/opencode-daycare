import { feedData } from "@/app/data/feed";
import FeedPosts from "@/components/feed-posts";
import ShareMomentLink from "@/components/share-moment-link";

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

      <ShareMomentLink />

      <div className="mb-3.5 flex items-center gap-3.5">
        <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D]">
          PUBLICADO HOY
        </span>
        <span className="h-px flex-1 bg-[#E7DAC8]" />
      </div>

      <FeedPosts />
    </div>
  );
}
