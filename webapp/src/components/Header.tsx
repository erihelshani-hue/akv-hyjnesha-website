"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LogOut, Settings } from "lucide-react";
import { UnreadBadge } from "@/components/UnreadBadge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";

interface HeaderProps {
  unreadCount: number;
  isAdmin: boolean;
}

export function Header({ unreadCount, isAdmin }: HeaderProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const navItems = [
    { href: "/rehearsals",    label: t("rehearsals") },
    { href: "/events",        label: t("events") },
    { href: "/announcements", label: t("announcements"), badge: unreadCount },
    { href: "/members",       label: t("members") },
  ];

  return (
    <header
      className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="https://akv-hyjnesha.com/images/Logo/470894537_17891580084134476_2369760557983885793_n.jpg"
            alt="AKV Hyjnesha Logo"
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <span className="font-playfair text-base font-semibold text-foreground">
            AKV &ldquo;Hyjnesha&rdquo;
          </span>
        </Link>

        {/* Desktop nav — hidden on mobile (bottom nav handles navigation there) */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map(({ href, label, badge }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`relative inline-flex items-center text-sm transition-colors ${
                  isActive ? "text-foreground border-b border-accent pb-0.5" : "text-muted hover:text-foreground"
                }`}
              >
                {label}
                {badge !== undefined && badge > 0 && <UnreadBadge count={badge} />}
              </Link>
            );
          })}
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitcher />
          <Link href="/settings" className="text-muted hover:text-foreground transition-colors" aria-label={t("settings")}>
            <Settings className="h-4 w-4" />
          </Link>
          <button onClick={handleLogout} className="text-muted hover:text-foreground transition-colors" aria-label={t("logout")}>
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile: language switcher only (navigation via bottom nav) */}
        <div className="md:hidden">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
