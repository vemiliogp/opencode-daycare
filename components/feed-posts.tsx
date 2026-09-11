"use client";

import { useFeed } from "@/components/feed-provider";
import PostCard from "@/components/post-card";

export default function FeedPosts() {
  const { posts } = useFeed();

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
