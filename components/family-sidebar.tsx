"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const navItems: NavItem[] = [
  {
    label: "Feed",
    href: "/family",
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
      </svg>
    ),
  },
  {
    label: "Resumen del día",
    href: "/family/resumen-dia",
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    ),
  },
  {
    label: "Mi cuenta",
    href: "/family/account",
    icon: (
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

function SunMark() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MenuMark() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function LogoutMark() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.75">
      <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-xl bg-[linear-gradient(155deg,#F8C3A8,#F2937A)]">
        <SunMark />
      </div>
      <div>
        <div className="font-title text-[17px] font-semibold leading-none text-ink">
          Familia
        </div>
      </div>
    </div>
  );
}

function NavItemLink({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(item.href);
  const base = "flex items-center gap-3 rounded-xl px-3 py-2.75 text-[14.5px]";
  const className = isActive
    ? `${base} bg-[#FBE3D8] font-extrabold text-[#D9583C]`
    : `${base} font-semibold text-[#6E6359]`;
  return (
    <Link href={item.href} onClick={onNavigate} className={className}>
      {item.icon}
      {item.label}
    </Link>
  );
}

export default function FamilySidebar({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const [fullName, setFullName] = useState<string>("");
  const [userInitial, setUserInitial] = useState<string>("");
  const [relationshipLabel, setRelationshipLabel] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || session.user.email || "";
        setFullName(name);
        setUserInitial(name.charAt(0).toUpperCase());

        const { data: profile } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", session.user.id)
          .single();

        if (profile?.full_name) {
          setFullName(profile.full_name);
          setUserInitial(profile.full_name.charAt(0).toUpperCase());
        }

        setRelationshipLabel("Familia");
      }
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const asideBase =
    "w-[248px] flex-col border-r border-border bg-surface px-4 py-6 lg:sticky lg:top-0 lg:h-screen lg:flex-none";

  return (
    <div className="flex min-h-screen w-full flex-1 flex-col lg:flex-row">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-surface px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={open}
          className="flex h-10 w-10 items-center justify-center rounded-[10px] text-ink hover:bg-background"
        >
          <MenuMark />
        </button>
        <Link href="/family" onClick={close}>
          <Brand />
        </Link>
      </header>

      {open && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={close}
          className="fixed inset-0 z-40 bg-ink/40 lg:hidden"
        />
      )}

      <aside
        className={
          open
            ? `fixed inset-y-0 left-0 z-50 flex shadow-2xl lg:shadow-none ${asideBase}`
            : `hidden lg:flex ${asideBase}`
        }
      >
        <Link
          href="/family"
          onClick={close}
          className="flex items-center gap-2.75 px-2 pt-1 pb-5.5"
        >
          <Brand />
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavItemLink key={item.label} item={item} onNavigate={close} />
          ))}
        </nav>
        <div className="mt-2.5 border-t border-border pt-3.5">
          <div className="flex items-center gap-2.75 px-2 py-1.5">
            <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-[#F2937A] font-title text-[16px] font-semibold text-white">
              {userInitial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-extrabold text-ink">{fullName}</div>
              <div className="text-[12px] text-muted">{relationshipLabel}</div>
            </div>
            <button
              type="button"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              onClick={handleLogout}
              className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-[10px] bg-background text-muted-strong hover:bg-[#FBE3D8] hover:text-[#D9583C]"
            >
              <LogoutMark />
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 lg:h-screen lg:overflow-y-auto">{children}</main>
    </div>
  );
}
