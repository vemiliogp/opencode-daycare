import AppSidebar from "@/components/app-sidebar";
import { FeedProvider } from "@/components/feed-provider";
import CreatePostDialog from "@/components/create-post-dialog";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <FeedProvider>
      <AppSidebar>{children}</AppSidebar>
      <CreatePostDialog />
    </FeedProvider>
  );
}
