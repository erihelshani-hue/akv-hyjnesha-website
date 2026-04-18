"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Music, Calendar, Bell, Users, Settings } from "lucide-react";

const NAV_ITEMS = [
  { href: "/rehearsals",    labelKey: "rehearsals",    Icon: Music },
  { href: "/events",        labelKey: "events",        Icon: Calendar },
  { href: "/announcements", labelKey: "announcements", Icon: Bell },
  { href: "/members",       labelKey: "members",       Icon: Users },
  { href: "/settings",      labelKey: "settings",      Icon: Settings },
] as const;

interface BottomNavProps {
  unreadCount: number;
}

export function BottomNav({ unreadCount }: BottomNavProps) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-border bg-background/96 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch justify-around h-14">
        {NAV_ITEMS.map(({ href, labelKey, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 relative transition-colors duration-150 ${
                isActive ? "text-accent" : "text-muted/60"
              }`}
            >
              {isActive && (
                <span className="absolute top-0 inset-x-2 h-[2px] rounded-full bg-accent" />
              )}
              <span className="relative">
                <Icon
                  className="h-[22px] w-[22px]"
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {labelKey === "announcements" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-0.5 text-[9px] font-bold leading-none text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
              <span
                className={`text-[9px] font-semibold uppercase tracking-wider ${
                  isActive ? "text-accent" : "text-muted/50"
                }`}
              >
                {t(labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
