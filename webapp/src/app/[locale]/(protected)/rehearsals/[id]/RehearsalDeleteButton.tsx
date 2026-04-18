"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { createClient } from "@/lib/supabase/client";
import { Trash2 } from "lucide-react";

interface RehearsalDeleteButtonProps {
  rehearsalId: string;
  locale: string;
}

export function RehearsalDeleteButton({ rehearsalId, locale }: RehearsalDeleteButtonProps) {
  const t = useTranslations("rehearsal");
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    const supabase = createClient();
    await supabase.from("rehearsals").delete().eq("id", rehearsalId);
    router.push("/rehearsals");
    router.refresh();
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="text-muted hover:text-red-400">
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
