"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface AnnouncementsMarkReadProps {
  unreadIds: string[];
  userId: string;
}

export function AnnouncementsMarkRead({ unreadIds, userId }: AnnouncementsMarkReadProps) {
  useEffect(() => {
    async function markRead() {
      const supabase = createClient();
      const rows = unreadIds.map((id) => ({
        user_id: userId,
        announcement_id: id,
      }));
      await supabase.from("announcement_reads").upsert(rows, {
        onConflict: "user_id,announcement_id",
        ignoreDuplicates: true,
      });
    }
    markRead();
  }, [unreadIds, userId]);

  return null;
}
