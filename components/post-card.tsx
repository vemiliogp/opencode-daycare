import type { Post, PostKind } from "@/app/data/feed";

type KindVisual = {
  badgeClass: string;
  badgeLabel: string;
  avatarClass: string;
  avatarIsIcon: boolean;
};

const kindVisuals: Record<PostKind, KindVisual> = {
  achievement: {
    badgeClass: "bg-[#CFEBD8] text-[#3E9B6C]",
    badgeLabel: "LOGRO",
    avatarClass: "bg-[#A9D9E8] text-[#1F7A93]",
    avatarIsIcon: false,
  },
  activity: {
    badgeClass: "bg-[#C7E7F1] text-[#2E89A6]",
    badgeLabel: "ACTIVIDAD",
    avatarClass: "bg-[#A9D9E8] text-[#1F7A93]",
    avatarIsIcon: false,
  },
  announcement: {
    badgeClass: "bg-[#CCD8F4] text-[#4E72C8]",
    badgeLabel: "ANUNCIO",
    avatarClass: "bg-[#CCD8F4] text-[#4E72C8]",
    avatarIsIcon: true,
  },
};

function MegaphoneMark() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 11 18-5v12L3 14v-3zM11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

function HeartMark() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="#E0654A"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function CommentMark() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
    </svg>
  );
}

function ImageIconMark() {
  return (
    <svg
      width="30"
      height="30"
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
  );
}

export default function PostCard({ post }: { post: Post }) {
  const visual = kindVisuals[post.kind];

  return (
    <article className="rounded-[20px] border border-border bg-surface px-5.5 py-5 shadow-[0_4px_16px_-12px_rgba(120,90,60,0.5)]">
      <header className="mb-3.5 flex items-center gap-3">
        <div
          className={`flex h-11 w-11 flex-none items-center justify-center rounded-full font-title text-[17px] font-semibold ${visual.avatarClass}`}
        >
          {visual.avatarIsIcon ? <MegaphoneMark /> : post.authorInitial}
        </div>
        <div className="flex-1">
          <div className="font-title text-[16.5px] font-semibold text-ink">
            {post.authorName}
          </div>
          <div className="text-[12.5px] text-muted">
            {post.time}
            {post.publishedByYou ? " · publicado por vos" : ""}
          </div>
        </div>
        <div
          className={`flex items-center gap-1.75 rounded-full px-3 py-1.5 text-[12px] font-extrabold tracking-[0.5px] ${visual.badgeClass}`}
        >
          <span className="h-2 w-2 rounded-full bg-current" />
          {visual.badgeLabel}
        </div>
      </header>
      <div className="mb-2.5 text-[12.5px] text-muted">{post.audience}</div>
      <p className="text-[15.5px] leading-[1.55] text-ink-soft">{post.body}</p>
      {post.photoCaption && (
        <a
          href="#"
          className="mt-3.5 flex h-[200px] flex-col items-center justify-center gap-2 rounded-[16px] border-[1.5px] border-dashed border-[#DBCDBA] bg-[#F4ECE1] text-[#B0A290]"
        >
          <ImageIconMark />
          <span className="text-[13.5px]">{post.photoCaption}</span>
        </a>
      )}
      <footer className="mt-4 flex items-center gap-4.5 border-t border-divider pt-3.5">
        <span className="flex items-center gap-1.75 text-[14px] font-bold text-[#E0654A]">
          <HeartMark />
          {post.hearts}
        </span>
        <a
          href="#"
          className="flex items-center gap-1.75 text-[14px] font-bold text-muted-strong"
        >
          <CommentMark />
          {post.comments}
        </a>
        <span className="flex-1" />
        <a href="#" className="text-[14px] font-extrabold text-[#C5503A]">
          Editar
        </a>
      </footer>
    </article>
  );
}
