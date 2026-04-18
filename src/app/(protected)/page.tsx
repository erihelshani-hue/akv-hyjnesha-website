import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { DashboardCard } from "@/components/DashboardCard";
import { getNextOccurrence } from "@/lib/recurring";
import { Link } from "@/i18n/navigation";
import { formatDate, formatTime } from "@/lib/utils";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("dashboard");
  const tAnnouncement = await getTranslations("announcement");
  const tCommon = await getTranslations("common");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const [rehearsalsRes, eventsRes, announcementsRes, readsRes] = await Promise.all([
    supabase.from("rehearsals").select("*").order("date"),
    supabase.from("events").select("*").order("date").gte("date", new Date().toISOString().substring(0, 10)),
    supabase.from("announcements").select("*").order("created_at", { ascending: false }).limit(3),
    supabase.from("announcement_reads").select("announcement_id").eq("user_id", user!.id),
  ]);

  const rehearsals = rehearsalsRes.data ?? [];
  const events = eventsRes.data ?? [];
  const announcements = announcementsRes.data ?? [];
  const reads = new Set(readsRes.data?.map((r) => r.announcement_id) ?? []);

  const nextRehearsal = getNextOccurrence(rehearsals);
  const nextEvent = events[0] ?? null;

  const rehearsalTitle = nextRehearsal
    ? (locale === "sq" ? nextRehearsal.rehearsal.title_sq : nextRehearsal.rehearsal.title)
    : null;
  const eventTitle = nextEvent
    ? (locale === "sq" ? nextEvent.title_sq : nextEvent.title)
    : null;

  return (
    <div className="space-y-8">
      {/* Welcome heading */}
      <div>
        <h1 className="font-playfair text-3xl font-semibold text-foreground">
          {t("title")}
        </h1>
        <p className="text-muted mt-1 text-sm">AKV &ldquo;<em className="italic font-playfair">Hyjnesha</em>&rdquo; · Graz</p>
      </div>

      {/* Next rehearsal + event */}
      <div className="grid gap-4 sm:grid-cols-2">
        <DashboardCard
          type="rehearsal"
          title={rehearsalTitle ?? ""}
          date={nextRehearsal?.date ?? null}
          time={nextRehearsal?.rehearsal.time ?? null}
          location={nextRehearsal?.rehearsal.location ?? null}
          isRecurring={nextRehearsal?.isRecurring}
          href={nextRehearsal ? `/${locale}/rehearsals/${nextRehearsal.rehearsal.id}` : `/${locale}/rehearsals`}
          locale={locale}
        />
        <DashboardCard
          type="event"
          title={eventTitle ?? ""}
          date={nextEvent?.date ?? null}
          time={nextEvent?.time ?? null}
          location={nextEvent?.location ?? null}
          href={nextEvent ? `/${locale}/events/${nextEvent.id}` : `/${locale}/events`}
          locale={locale}
        />
      </div>

      {/* Recent announcements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-playfair text-xl font-semibold text-foreground">
            {t("recentAnnouncements")}
          </h2>
          <Link href="/announcements" className="text-sm text-muted hover:text-foreground transition-colors">
            {t("viewAll")}
          </Link>
        </div>

        {announcements.length === 0 ? (
          <p className="text-muted text-sm">{t("noAnnouncements")}</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => {
              const isUnread = !reads.has(announcement.id);
              const title = locale === "sq" ? announcement.title_sq : announcement.title;
              const body = locale === "sq" ? announcement.body_sq : announcement.body;
              return (
                <Link
                  key={announcement.id}
                  href={`/announcements`}
                  className="block p-4 border border-border bg-surface hover:border-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    {isUnread && (
                      <span className="mt-1.5 shrink-0 h-2 w-2 bg-accent rounded-full" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{title}</p>
                      <p className="text-muted text-xs mt-0.5 line-clamp-2">{body}</p>
                      <p className="text-xs text-muted/60 mt-1">
                        {tCommon("postedOn")} {formatDate(announcement.created_at.substring(0, 10), locale)}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
