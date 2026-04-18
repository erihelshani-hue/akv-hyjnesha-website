"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  async function switchLocale(newLocale: string) {
    localStorage.setItem("preferred-locale", newLocale);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ language_preference: newLocale })
        .eq("id", user.id);
    }

    router.replace(pathname, { locale: newLocale as "de" | "sq" });
  }

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <button
        onClick={() => switchLocale("de")}
        className={`px-1 py-0.5 transition-colors ${
          locale === "de"
            ? "text-foreground border-b border-accent"
            : "text-muted hover:text-foreground"
        }`}
      >
        DE
      </button>
      <span className="text-border">·</span>
      <button
        onClick={() => switchLocale("sq")}
        className={`px-1 py-0.5 transition-colors ${
          locale === "sq"
            ? "text-foreground border-b border-accent"
            : "text-muted hover:text-foreground"
        }`}
      >
        SQ
      </button>
    </div>
  );
}
