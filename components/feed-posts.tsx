"use client";

import { useFeed } from "@/components/feed-provider";
import PostCard from "@/components/post-card";
import type { Post } from "@/app/data/feed";

export default function FeedPosts({ mode = "staff", posts: passedPosts }: { mode?: "staff" | "family"; posts?: Post[] }) {
  const { posts: contextPosts } = useFeed();
  const posts = passedPosts ?? contextPosts;

  if (posts.length === 0) {
    return (
      <section aria-label="Feed" className="py-8 text-center text-muted">
        <p className="text-[15.5px]">No hay publicaciones aún.</p>
      </section>
    );
  }

  return (
    <section aria-label="Feed">
      <ul className="flex flex-col gap-4">
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard post={post} mode={mode} />
          </li>
        ))}
      </ul>
    </section>
  );
}
