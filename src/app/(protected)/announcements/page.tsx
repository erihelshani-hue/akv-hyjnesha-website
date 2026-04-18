import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { AnnouncementsMarkRead } from "./AnnouncementsMarkRead";
import { AnnouncementDeleteButton } from "./AnnouncementDeleteButton";
import { formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";

export default async function AnnouncementsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("announcement");
  const tCommon = await getTranslations("common");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const isAdmin = profile?.role === "admin";

  const [announcementsRes, readsRes] = await Promise.all([
    supabase.from("announcements").select("*").order("created_at", { ascending: false }),
    supabase.from("announcement_reads").select("announcement_id").eq("user_id", user!.id),
  ]);

  const announcements = announcementsRes.data ?? [];
  const readIds = new Set(readsRes.data?.map((r) => r.announcement_id) ?? []);
  const unreadIds = announcements.filter((a) => !readIds.has(a.id)).map((a) => a.id);

  return (
    <div className="space-y-6">
      {/* Mark read on client mount */}
      {unreadIds.length > 0 && <AnnouncementsMarkRead unreadIds={unreadIds} userId={user!.id} />}

      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-3xl font-semibold text-foreground">
          {t("title")}
        </h1>
        {isAdmin && (
          <Link href="/announcements/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              {t("new")}
            </Button>
          </Link>
        )}
      </div>

      {announcements.length === 0 ? (
        <p className="text-muted text-sm">{t("noAnnouncements")}</p>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const isUnread = !readIds.has(announcement.id);
            const title = locale === "sq" ? announcement.title_sq : announcement.title;
            const body = locale === "sq" ? announcement.body_sq : announcement.body;
            return (
              <div
                key={announcement.id}
                className={`p-5 border transition-colors ${
                  isUnread ? "border-accent/40 bg-accent/5" : "border-border bg-surface"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    {isUnread && (
                      <span className="mt-1.5 shrink-0 h-2 w-2 bg-accent rounded-full" />
                    )}
                    <div className="min-w-0">
                      <h2 className="font-playfair text-lg font-semibold text-foreground">{title}</h2>
                      <p className="text-xs text-muted mt-1">
                        {tCommon("postedOn")} {formatDate(announcement.created_at.substring(0, 10), locale)}
                      </p>
                      <p className="text-sm text-foreground/90 mt-3 leading-relaxed whitespace-pre-wrap">
                        {body}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <AnnouncementDeleteButton announcementId={announcement.id} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
