import AppSidebar from "@/components/app-sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppSidebar>{children}</AppSidebar>;
}
