interface UnreadBadgeProps {
  count: number;
}

export function UnreadBadge({ count }: UnreadBadgeProps) {
  if (count <= 0) return null;
  return (
    <span className="ml-1 inline-flex h-4 w-4 items-center justify-center bg-accent text-accent-foreground text-[10px] font-bold leading-none">
      {count > 9 ? "9+" : count}
    </span>
  );
}
