import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { EventRSVP } from "./EventRSVP";
import { EventDeleteButton } from "./EventDeleteButton";
import { Link } from "@/i18n/navigation";
import { formatDate, formatTime } from "@/lib/utils";
import { MapPin, Clock, Shirt, Users, ExternalLink, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AttendanceStatus } from "@/types/database";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("event");
  const tCommon = await getTranslations("common");
  const tRsvp = await getTranslations("rsvp");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const [eventRes, profileRes] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).single(),
    supabase.from("profiles").select("role").eq("id", user!.id).single(),
  ]);

  if (!eventRes.data) notFound();

  const event = eventRes.data;
  const isAdmin = profileRes.data?.role === "admin";

  const { data: attendance } = await supabase
    .from("attendances")
    .select("status")
    .eq("user_id", user!.id)
    .eq("entity_type", "event")
    .eq("entity_id", id)
    .eq("entity_date", event.date)
    .single();

  const { count: yesCount } = await supabase
    .from("attendances")
    .select("*", { count: "exact", head: true })
    .eq("entity_type", "event")
    .eq("entity_id", id)
    .eq("status", "yes");

  let attendees: { profile: { full_name: string }; status: AttendanceStatus }[] = [];
  if (isAdmin) {
    const { data } = await supabase
      .from("attendances")
      .select("status, profiles(full_name)")
      .eq("entity_type", "event")
      .eq("entity_id", id);
    attendees = (data ?? []) as typeof attendees;
  }

  const title = locale === "sq" ? event.title_sq : event.title;
  const notes = locale === "sq" ? event.notes_sq : event.notes;

  return (
    <div className="max-w-2xl space-y-6">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        {tCommon("back")}
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h1 className="font-playfair text-3xl font-semibold text-foreground">{title}</h1>
            <Badge variant="outline" className="text-xs">{t(`type.${event.event_type}`)}</Badge>
          </div>
          <p className="text-gold font-medium">{formatDate(event.date, locale)}</p>
        </div>
        {isAdmin && <EventDeleteButton eventId={id} />}
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-3.5 w-3.5 text-muted shrink-0" />
          <span className="text-muted w-28">{t("time")}:</span>
          <span className="text-foreground">{formatTime(event.time)}</span>
        </div>
        {event.meetup_time && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-3.5 w-3.5 text-muted shrink-0" />
            <span className="text-muted w-28">{t("meetupTime")}:</span>
            <span className="text-foreground">{formatTime(event.meetup_time)}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3.5 w-3.5 text-muted shrink-0" />
          <span className="text-muted w-28">{t("location")}:</span>
          <span className="text-foreground">{event.location}</span>
          {event.location_url && (
            <a
              href={event.location_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {t("locationLink")}
            </a>
          )}
        </div>
        {event.dress_code && (
          <div className="flex items-center gap-2 text-sm">
            <Shirt className="h-3.5 w-3.5 text-muted shrink-0" />
            <span className="text-muted w-28">{t("dressCode")}:</span>
            <span className="text-foreground">{event.dress_code}</span>
          </div>
        )}
        {notes && (
          <div className="flex items-start gap-2 text-sm pt-1">
            <span className="text-muted w-32 shrink-0">{t("notes")}:</span>
            <span className="text-foreground">{notes}</span>
          </div>
        )}
      </div>

      <div className="h-px bg-border" />

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-muted">{tRsvp("yourStatus")}</p>
        <EventRSVP
          entityId={id}
          eventDate={event.date}
          currentStatus={attendance?.status as AttendanceStatus ?? null}
          yesCount={yesCount ?? 0}
        />
      </div>

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
