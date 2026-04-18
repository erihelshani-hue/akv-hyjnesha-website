"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { InviteMemberModal } from "@/components/InviteMemberModal";
import { UserPlus } from "lucide-react";

export function InviteButton() {
  const t = useTranslations("member");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4 mr-1" />
        {t("invite")}
      </Button>
      <InviteMemberModal open={open} onOpenChange={setOpen} />
    </>
  );
}
