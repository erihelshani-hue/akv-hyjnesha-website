import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";

export function RecurringTag() {
  const t = useTranslations("rehearsal");
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted border border-border px-2 py-0.5">
      <RefreshCw className="h-3 w-3" />
      {t("recurring")}
    </span>
  );
}
