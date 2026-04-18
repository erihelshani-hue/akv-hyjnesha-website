import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/utils";
import { Plus, MapPin, Clock } from "lucide-react";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("event");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const today = new Date().toISOString().substring(0, 10);

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .gte("date", today)
    .order("date");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-3xl font-semibold text-foreground">
          {t("title")}
        </h1>
        {isAdmin && (
          <Link href="/events/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              {t("new")}
            </Button>
          </Link>
        )}
      </div>

      {(!events || events.length === 0) ? (
        <p className="text-muted text-sm">{t("noUpcoming")}</p>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const title = locale === "sq" ? event.title_sq : event.title;
            const notes = locale === "sq" ? event.notes_sq : event.notes;
            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="block border border-border bg-surface hover:border-accent/50 transition-colors p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-playfair text-lg font-semibold text-foreground">{title}</h2>
                      <Badge variant="outline" className="text-xs">
                        {t(`type.${event.event_type}`)}
                      </Badge>
                    </div>
                    <p className="text-gold text-sm font-medium mt-1">{formatDate(event.date, locale)}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1.5 text-xs text-muted">
                        <Clock className="h-3 w-3" />
                        {formatTime(event.time)}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </span>
                    </div>
                    {notes && (
                      <p className="text-xs text-muted mt-2 line-clamp-2">{notes}</p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
