"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/types/database";

interface RSVPBarProps {
  entityType: "rehearsal" | "event";
  entityId: string;
  entityDate?: string;
  currentStatus: AttendanceStatus | null;
  yesCount: number;
  onRSVP: (status: AttendanceStatus) => Promise<void>;
}

export function RSVPBar({
  currentStatus,
  yesCount,
  onRSVP,
}: RSVPBarProps) {
  const t = useTranslations("rsvp");
  const [status, setStatus] = useState<AttendanceStatus | null>(currentStatus);
  const [isPending, startTransition] = useTransition();

  function handleRSVP(newStatus: AttendanceStatus) {
    startTransition(async () => {
      await onRSVP(newStatus);
      setStatus(newStatus);
    });
  }

  const count = status === "yes" ? yesCount : yesCount;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <RSVPButton
          label={t("yes")}
          value="yes"
          current={status}
          disabled={isPending}
          onClick={() => handleRSVP("yes")}
          activeClass="bg-accent text-accent-foreground border-accent"
        />
        <RSVPButton
          label={t("maybe")}
          value="maybe"
          current={status}
          disabled={isPending}
          onClick={() => handleRSVP("maybe")}
          activeClass="bg-surface-2 text-foreground border-foreground/30"
        />
        <RSVPButton
          label={t("no")}
          value="no"
          current={status}
          disabled={isPending}
          onClick={() => handleRSVP("no")}
          activeClass="bg-surface-2 text-muted border-muted"
        />
      </div>
      <p className="text-xs text-muted">
        {count === 1 ? t("attendingOne") : t("attending", { count })}
      </p>
    </div>
  );
}

function RSVPButton({
  label,
  value,
  current,
  disabled,
  onClick,
  activeClass,
}: {
  label: string;
  value: AttendanceStatus;
  current: AttendanceStatus | null;
  disabled: boolean;
  onClick: () => void;
  activeClass: string;
}) {
  const isActive = current === value;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex-1 py-2 text-sm font-medium border transition-colors disabled:opacity-60",
        isActive
          ? activeClass
          : "bg-transparent border-border text-muted hover:border-foreground/30 hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}
