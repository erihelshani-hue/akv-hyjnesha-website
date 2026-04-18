"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import type { RecurrenceDay } from "@/types/database";

const DAYS: RecurrenceDay[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function NewRehearsalPage() {
  const t = useTranslations("rehearsal");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [form, setForm] = useState({
    title: "",
    title_sq: "",
    date: "",
    time: "",
    location: "",
    notes: "",
    notes_sq: "",
    recurrence_day: "MON" as RecurrenceDay,
    recurrence_time: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      title: form.title,
      title_sq: form.title_sq,
      date: isRecurring ? new Date().toISOString().substring(0, 10) : form.date,
      time: form.time,
      location: form.location,
      notes: form.notes || null,
      notes_sq: form.notes_sq || null,
      is_recurring: isRecurring,
      recurrence_day: isRecurring ? form.recurrence_day : null,
      recurrence_time: isRecurring ? form.recurrence_time || form.time : null,
      created_by: user?.id,
    };

    const { data, error } = await supabase.from("rehearsals").insert(payload).select().single();
    if (!error && data) {
      router.push(`/rehearsals/${data.id}`);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/rehearsals" className="text-muted hover:text-foreground transition-colors">
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

        <div className="flex items-center gap-3">
          <Checkbox
            id="recurring"
            checked={isRecurring}
            onCheckedChange={(v) => setIsRecurring(!!v)}
          />
          <Label htmlFor="recurring" className="cursor-pointer text-foreground">
            {t("form.isRecurring")}
          </Label>
        </div>

        {isRecurring ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("form.recurrenceDay")}</Label>
              <Select value={form.recurrence_day} onValueChange={(v) => update("recurrence_day", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>{t(`days.${d}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("form.recurrenceTime")}</Label>
              <Input type="time" value={form.recurrence_time} onChange={(e) => update("recurrence_time", e.target.value)} />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("form.date")}</Label>
              <Input type="date" value={form.date} onChange={(e) => update("date", e.target.value)} required={!isRecurring} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("form.time")}</Label>
              <Input type="time" value={form.time} onChange={(e) => update("time", e.target.value)} required />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label>{t("form.location")}</Label>
          <Input value={form.location} onChange={(e) => update("location", e.target.value)} required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("form.notesDe")}</Label>
            <Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("form.notesSq")}</Label>
            <Textarea value={form.notes_sq} onChange={(e) => update("notes_sq", e.target.value)} rows={3} />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? t("creating") : t("create")}
        </Button>
      </form>
    </div>
  );
}
