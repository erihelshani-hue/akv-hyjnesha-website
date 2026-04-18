"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { createClient } from "@/lib/supabase/client";
import { Trash2 } from "lucide-react";

export function AnnouncementDeleteButton({ announcementId }: { announcementId: string }) {
  const t = useTranslations("announcement");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const supabase = createClient();
    await supabase.from("announcements").delete().eq("id", announcementId);
    router.refresh();
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="text-muted hover:text-red-400 shrink-0">
        <Trash2 className="h-4 w-4" />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t("delete")}
        description={t("deleteConfirm")}
        onConfirm={handleDelete}
      />
    </>
  );
}
