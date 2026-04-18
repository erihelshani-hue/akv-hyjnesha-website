import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { MemberCard } from "@/components/MemberCard";
import { InviteButton } from "./InviteButton";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("member");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const [profileRes, membersRes] = await Promise.all([
    supabase.from("profiles").select("role").eq("id", user!.id).single(),
    supabase.from("profiles").select("*").order("full_name"),
  ]);

  const isAdmin = profileRes.data?.role === "admin";
  const members = membersRes.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-playfair text-3xl font-semibold text-foreground">
          {t("title")}
        </h1>
        {isAdmin && <InviteButton />}
      </div>

      {members.length === 0 ? (
        <p className="text-muted text-sm">{t("noMembers")}</p>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isAdmin={isAdmin}
              currentUserId={user!.id}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}
