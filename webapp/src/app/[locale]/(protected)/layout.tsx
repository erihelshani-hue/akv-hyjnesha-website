import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/Header";

export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Count unread announcements
  const { data: announcements } = await supabase
    .from("announcements")
    .select("id");

  const { data: reads } = await supabase
    .from("announcement_reads")
    .select("announcement_id")
    .eq("user_id", user.id);

  const readIds = new Set(reads?.map((r) => r.announcement_id) ?? []);
  const unreadCount = (announcements ?? []).filter((a) => !readIds.has(a.id)).length;

  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen bg-background">
      <Header unreadCount={unreadCount} isAdmin={isAdmin} />
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
