import { Radio, ShieldCheck, UserCheck } from "lucide-react";
import type { Role } from "../types/request";

const roleConfig: Record<Role, { icon: typeof Radio; classes: string }> = {
  Operator: { icon: Radio, classes: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  Verifier: { icon: ShieldCheck, classes: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  Holder: { icon: UserCheck, classes: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
};

export function RoleBadge({ role }: { role: Role }) {
  const cfg = roleConfig[role];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.classes}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {role}
    </span>
  );
}
