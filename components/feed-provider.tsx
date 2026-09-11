"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { feedData, type Post } from "@/app/data/feed";

type FeedContextValue = {
  posts: Post[];
  addPost: (post: Post) => void;
  postDialogOpen: boolean;
  openPostDialog: () => void;
  closePostDialog: () => void;
};

const FeedContext = createContext<FeedContextValue | null>(null);

export function FeedProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(feedData.posts);
  const [postDialogOpen, setPostDialogOpen] = useState(false);

  const addPost = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
  };

  const openPostDialog = () => setPostDialogOpen(true);
  const closePostDialog = () => setPostDialogOpen(false);

  return (
    <FeedContext.Provider
      value={{ posts, addPost, postDialogOpen, openPostDialog, closePostDialog }}
    >
      {children}
    </FeedContext.Provider>
  );
}

export function useFeed() {
  const ctx = useContext(FeedContext);
  if (!ctx) {
    throw new Error("useFeed must be used within a FeedProvider");
  }
  return ctx;
}
