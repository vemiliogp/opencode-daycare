import FamilySidebar from "@/components/family-sidebar";

export default function FamilyLayout({ children }: { children: React.ReactNode }) {
  return <FamilySidebar>{children}</FamilySidebar>;
}
