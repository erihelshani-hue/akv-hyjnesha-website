"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/RoleBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Profile } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

interface MemberCardProps {
  member: Profile;
  isAdmin: boolean;
  currentUserId: string;
  locale: string;
}

export function MemberCard({ member, isAdmin, currentUserId, locale }: MemberCardProps) {
  const t = useTranslations("member");
  const [role, setRole] = useState(member.role);

  async function handleRoleChange(newRole: string) {
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ role: newRole as "admin" | "member" })
      .eq("id", member.id);
    setRole(newRole as "admin" | "member");
  }

  const initials = member.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-4 p-4 border border-border bg-surface">
      <Avatar className="h-12 w-12">
        {member.avatar_url && <AvatarImage src={member.avatar_url} alt={member.full_name} />}
        <AvatarFallback className="font-playfair text-sm">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground truncate">{member.full_name}</p>
          <RoleBadge role={role} />
          {member.id === currentUserId && (
            <span className="text-xs text-muted">(du)</span>
          )}
        </div>
        <p className="text-xs text-muted truncate">{member.email}</p>
        <p className="text-xs text-muted mt-0.5">
          {t("joined")} {formatDate(member.created_at.substring(0, 10), locale)}
        </p>
      </div>
      {isAdmin && member.id !== currentUserId && (
        <div className="shrink-0">
          <Select value={role} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-32 text-xs h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">{t("roleMember")}</SelectItem>
              <SelectItem value="admin">{t("roleAdmin")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
