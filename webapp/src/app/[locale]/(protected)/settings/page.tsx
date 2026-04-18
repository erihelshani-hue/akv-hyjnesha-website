"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/navigation";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (data) setFullName(data.full_name);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    setError(null);
    setSaved(false);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", userId);

    if (error) {
      setError(t("error"));
    } else {
      setSaved(true);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md space-y-8">
      <h1 className="font-playfair text-3xl font-semibold text-foreground">{t("title")}</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="full-name">{t("displayName")}</Label>
          <Input
            id="full-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t("displayNamePlaceholder")}
            required
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {saved && <p className="text-sm text-green-400">{t("saved")}</p>}

        <Button type="submit" disabled={loading}>
          {loading ? t("saving") : t("save")}
        </Button>
      </form>

      <div className="space-y-2">
        <p className="text-sm text-muted">{t("language")}</p>
        <div className="flex gap-3">
          <button
            onClick={() => router.replace("/settings", { locale: "de" })}
            className={`px-4 py-2 text-sm border transition-colors ${
              locale === "de"
                ? "border-accent bg-accent/10 text-foreground"
                : "border-border text-muted hover:border-foreground/30"
            }`}
          >
            Deutsch
          </button>
          <button
            onClick={() => router.replace("/settings", { locale: "sq" })}
            className={`px-4 py-2 text-sm border transition-colors ${
              locale === "sq"
                ? "border-accent bg-accent/10 text-foreground"
                : "border-border text-muted hover:border-foreground/30"
            }`}
          >
            Shqip
          </button>
        </div>
      </div>
    </div>
  );
}
