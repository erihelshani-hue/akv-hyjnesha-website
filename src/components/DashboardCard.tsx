import Link from "next/link";
import { useTranslations } from "next-intl";
import { MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RecurringTag } from "@/components/RecurringTag";
import { formatDate, formatTime } from "@/lib/utils";

interface DashboardCardProps {
  type: "rehearsal" | "event";
  title: string;
  date: string | null;
  time: string | null;
  location: string | null;
  isRecurring?: boolean;
  href: string;
  locale: string;
}

export function DashboardCard({
  type,
  title,
  date,
  time,
  location,
  isRecurring,
  href,
  locale,
}: DashboardCardProps) {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const label = type === "rehearsal" ? t("nextRehearsal") : t("nextEvent");

  if (!date) {
    return (
      <Card className="p-6">
        <p className="text-xs uppercase tracking-widest text-muted mb-2">{label}</p>
        <p className="text-muted text-sm">
          {type === "rehearsal" ? t("noUpcomingRehearsal") : t("noUpcomingEvent")}
        </p>
      </Card>
    );
  }

  return (
    <Link href={href} className="block group">
      <Card className="p-6 group-hover:border-accent/50 transition-colors">
        <p className="text-xs uppercase tracking-widest text-muted mb-3">{label}</p>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-playfair text-2xl font-semibold text-foreground leading-tight">
            {title}
          </h3>
          {isRecurring && <RecurringTag />}
        </div>
        <p className="mt-2 text-gold font-medium">
          {formatDate(date, locale)}
        </p>
        <div className="mt-3 space-y-1">
          {time && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{tCommon("at")} {formatTime(time)} Uhr</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{location}</span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
