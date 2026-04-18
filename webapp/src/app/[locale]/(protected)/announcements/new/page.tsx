"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";

export default function NewAnnouncementPage() {
  const t = useTranslations("announcement");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    title_sq: "",
    body: "",
    body_sq: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("announcements").insert({
      title: form.title,
      title_sq: form.title_sq,
      body: form.body,
      body_sq: form.body_sq,
      created_by: user?.id,
    });

    router.push("/announcements");
    setLoading(false);
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/announcements" className="text-muted hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-playfair text-2xl font-semibold text-foreground">{t("new")}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("form.titleDe")}</Label>
            <Input value={form.title} onChange={(e) => update("title", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>{t("form.titleSq")}</Label>
            <Input value={form.title_sq} onChange={(e) => update("title_sq", e.target.value)} required />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("form.bodyDe")}</Label>
            <Textarea
              value={form.body}
              onChange={(e) => update("body", e.target.value)}
              rows={8}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>{t("form.bodySq")}</Label>
            <Textarea
              value={form.body_sq}
              onChange={(e) => update("body_sq", e.target.value)}
              rows={8}
              required
            />
          </div>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? t("creating") : t("create")}
        </Button>
      </form>
    </div>
  );
}
