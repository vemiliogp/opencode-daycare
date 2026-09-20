import StaffSidebar from "@/components/staff-sidebar";
import { FeedProvider } from "@/components/feed-provider";
import CreatePostDialog from "@/components/create-post-dialog";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <FeedProvider>
      <StaffSidebar>{children}</StaffSidebar>
      <CreatePostDialog />
    </FeedProvider>
  );
}
