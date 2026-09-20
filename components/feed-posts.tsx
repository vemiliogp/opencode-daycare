"use client";

import { useFeed } from "@/components/feed-provider";
import PostCard from "@/components/post-card";

export default function FeedPosts() {
  const { posts } = useFeed();

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
            <PostCard post={post} />
          </li>
        ))}
      </ul>
    </section>
  );
}
