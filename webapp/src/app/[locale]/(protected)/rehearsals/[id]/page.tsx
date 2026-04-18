import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getOccurrencesForRehearsal } from "@/lib/recurring";
import { RSVPBar } from "@/components/RSVPBar";
import { RecurringTag } from "@/components/RecurringTag";
import { RehearsalDeleteButton } from "./RehearsalDeleteButton";
import { RehearsalRSVP } from "./RehearsalRSVP";
import { Link } from "@/i18n/navigation";
import { formatDate, formatTime } from "@/lib/utils";
import { MapPin, Clock, ArrowLeft } from "lucide-react";
import type { AttendanceStatus } from "@/types/database";

export default async function RehearsalDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { locale, id } = await params;
  const { date: queryDate } = await searchParams;
  const t = await getTranslations("rehearsal");
  const tCommon = await getTranslations("common");
  const tRsvp = await getTranslations("rsvp");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const [rehearsalRes, profileRes] = await Promise.all([
    supabase.from("rehearsals").select("*").eq("id", id).single(),
    supabase.from("profiles").select("role").eq("id", user!.id).single(),
  ]);

  if (!rehearsalRes.data) notFound();

  const rehearsal = rehearsalRes.data;
  const isAdmin = profileRes.data?.role === "admin";

  const occurrences = getOccurrencesForRehearsal(rehearsal, 8);
  const targetDate = queryDate ?? occurrences[0]?.date ?? rehearsal.date;

  // Get attendance for this occurrence
  const { data: attendance } = await supabase
    .from("attendances")
    .select("status")
    .eq("user_id", user!.id)
    .eq("entity_type", "rehearsal")
    .eq("entity_id", id)
    .eq("entity_date", targetDate)
    .single();

  // Count yes responses
  const { count: yesCount } = await supabase
    .from("attendances")
    .select("*", { count: "exact", head: true })
    .eq("entity_type", "rehearsal")
    .eq("entity_id", id)
    .eq("entity_date", targetDate)
    .eq("status", "yes");

  // Admin: get full breakdown
  let attendees: { profile: { full_name: string }; status: AttendanceStatus }[] = [];
  if (isAdmin) {
    const { data } = await supabase
      .from("attendances")
      .select("status, profiles(full_name)")
      .eq("entity_type", "rehearsal")
      .eq("entity_id", id)
      .eq("entity_date", targetDate);
    attendees = (data ?? []) as typeof attendees;
  }

  const title = locale === "sq" ? rehearsal.title_sq : rehearsal.title;
  const notes = locale === "sq" ? rehearsal.notes_sq : rehearsal.notes;

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/rehearsals" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        {tCommon("back")}
      </Link>

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-playfair text-3xl font-semibold text-foreground">
            {title}
          </h1>
          {isAdmin && <RehearsalDeleteButton rehearsalId={id} locale={locale} />}
        </div>
        {rehearsal.is_recurring && <RecurringTag />}
      </div>

      {/* Occurrence selector for recurring */}
      {rehearsal.is_recurring && occurrences.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-muted mb-2">{t("recurring")}</p>
          <div className="flex flex-wrap gap-2">
            {occurrences.map((occ) => (
              <Link
                key={occ.date}
                href={`/rehearsals/${id}?date=${occ.date}`}
                className={`text-xs px-3 py-1.5 border transition-colors ${
                  occ.date === targetDate
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border text-muted hover:border-foreground/30"
                }`}
              >
                {formatDate(occ.date, locale)}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="h-px bg-border" />

      {/* Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted w-20 shrink-0">{t("time")}:</span>
          <span className="text-foreground flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-muted" />
            {formatDate(targetDate, locale)} {tCommon("at")} {formatTime(rehearsal.recurrence_time ?? rehearsal.time)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted w-20 shrink-0">{t("location")}:</span>
          <span className="text-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-muted" />
            {rehearsal.location}
          </span>
        </div>
        {notes && (
          <div className="flex items-start gap-2 text-sm">
            <span className="text-muted w-20 shrink-0 pt-0.5">{t("notes")}:</span>
            <span className="text-foreground">{notes}</span>
          </div>
        )}
      </div>

      <div className="h-px bg-border" />

      {/* RSVP */}
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted">{tRsvp("yourStatus")}</p>
        <RehearsalRSVP
          entityId={id}
          entityDate={targetDate}
          currentStatus={attendance?.status as AttendanceStatus ?? null}
          yesCount={yesCount ?? 0}
        />
      </div>

      {/* Admin breakdown */}
      {isAdmin && attendees.length > 0 && (
        <>
          <div className="h-px bg-border" />
          <div>
            <p className="text-xs uppercase tracking-widest text-muted mb-3">{tRsvp("attendees")}</p>
            <div className="space-y-2">
              {attendees.map((att, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{att.profile?.full_name}</span>
                  <span className={`text-xs px-2 py-0.5 ${
                    att.status === "yes" ? "text-green-400 bg-green-400/10" :
                    att.status === "no" ? "text-red-400 bg-red-400/10" :
                    "text-muted bg-surface-2"
                  }`}>
                    {att.status === "yes" ? tRsvp("yes") : att.status === "no" ? tRsvp("no") : tRsvp("maybe")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
