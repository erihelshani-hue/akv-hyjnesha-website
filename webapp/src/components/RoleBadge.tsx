import { Badge } from "@/components/ui/badge";

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  if (role !== "admin") return null;
  return (
    <Badge variant="gold" className="text-xs uppercase tracking-wider">
      Admin
    </Badge>
  );
}
