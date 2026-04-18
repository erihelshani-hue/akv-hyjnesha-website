import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getUpcomingOccurrences } from "@/lib/recurring";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { RecurringTag } from "@/components/RecurringTag";
import { formatDate, formatTime } from "@/lib/utils";
import { Plus, MapPin, Clock } from "lucide-react";

export default async function RehearsalsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("rehearsal");
  const tCommon = await getTranslations("common");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const isAdmin = profile?.role === "admin";

  const { data: rehearsals } = await supabase
    .from("rehearsals")
    .select("*")
    .order("date");

  const occurrences = getUpcomingOccurrences(rehearsals ?? [], 16);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-3xl font-semibold text-foreground">
          {t("title")}
        </h1>
        {isAdmin && (
          <Link href="/rehearsals/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              {t("new")}
            </Button>
          </Link>
        )}
      </div>

      {occurrences.length === 0 ? (
        <p className="text-muted text-sm">{t("noUpcoming")}</p>
      ) : (
        <div className="space-y-3">
          {occurrences.map((occ) => {
            const title = locale === "sq" ? occ.rehearsal.title_sq : occ.rehearsal.title;
            const notes = locale === "sq" ? occ.rehearsal.notes_sq : occ.rehearsal.notes;
            return (
              <Link
                key={`${occ.rehearsal.id}-${occ.date}`}
                href={`/rehearsals/${occ.rehearsal.id}`}
                className="block border border-border bg-surface hover:border-accent/50 transition-colors p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-playfair text-lg font-semibold text-foreground">{title}</h2>
                      {occ.isRecurring && <RecurringTag />}
                    </div>
                    <p className="text-gold text-sm font-medium mt-1">{formatDate(occ.date, locale)}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1.5 text-xs text-muted">
                        <Clock className="h-3 w-3" />
                        {formatTime(occ.rehearsal.time)}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted">
                        <MapPin className="h-3 w-3" />
                        {occ.rehearsal.location}
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
