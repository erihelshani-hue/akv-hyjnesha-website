"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X, LogOut, Settings } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { UnreadBadge } from "@/components/UnreadBadge";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

interface HeaderProps {
  unreadCount: number;
  isAdmin: boolean;
}

export function Header({ unreadCount, isAdmin }: HeaderProps) {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const navItems = [
    { href: "/rehearsals", label: t("rehearsals") },
    { href: "/events", label: t("events") },
    { href: "/announcements", label: t("announcements"), badge: unreadCount },
    { href: "/members", label: t("members") },
  ];

  function NavLink({ href, label, badge }: { href: string; label: string; badge?: number }) {
    const isActive = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        className={`relative inline-flex items-center text-sm transition-colors ${
          isActive
            ? "text-foreground border-b border-accent pb-0.5"
            : "text-muted hover:text-foreground"
        }`}
        onClick={() => setMobileOpen(false)}
      >
        {label}
        {badge !== undefined && badge > 0 && <UnreadBadge count={badge} />}
      </Link>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo + Name */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src="https://akv-hyjnesha.com/images/Logo/470894537_17891580084134476_2369760557983885793_n.jpg"
            alt="AKV Hyjnesha Logo"
            width={32}
            height={32}
            className="rounded-full object-cover"
          />
          <span className="font-playfair text-base font-semibold text-foreground hidden sm:block">
            AKV &ldquo;Hyjnesha&rdquo;
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/settings"
            className="hidden md:flex text-muted hover:text-foreground transition-colors"
            aria-label={t("settings")}
          >
            <Settings className="h-4 w-4" />
          </Link>
          <button
            onClick={handleLogout}
            className="hidden md:flex text-muted hover:text-foreground transition-colors"
            aria-label={t("logout")}
          >
            <LogOut className="h-4 w-4" />
          </button>

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button className="md:hidden text-muted hover:text-foreground transition-colors">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 pt-12">
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <NavLink key={item.href} {...item} />
                ))}
                <div className="h-px bg-border my-2" />
                <Link
                  href="/settings"
                  className="text-sm text-muted hover:text-foreground flex items-center gap-2"
                  onClick={() => setMobileOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  {t("settings")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-muted hover:text-foreground flex items-center gap-2 text-left"
                >
                  <LogOut className="h-4 w-4" />
                  {t("logout")}
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
