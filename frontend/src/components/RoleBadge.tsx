import { Radio, ShieldCheck, UserCheck } from "lucide-react";
import type { Role } from "../types/request";

const roleConfig = {
  Operator: { icon: Radio, label: "Operador", classes: "bg-sky-500/15 text-sky-300 border-sky-500/30" },
  Verifier: { icon: ShieldCheck, label: "Verificador", classes: "bg-amber-500/15 text-amber-300 border-amber-500/30" },
  Holder: { icon: UserCheck, label: "Titular", classes: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
};

export function RoleBadge({ role }: { role: Role }) {
  if (!role) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-navy-900/70 px-3 py-1 text-xs font-semibold text-navy-200">
        Sin rol
      </span>
    );
  }

  const cfg = roleConfig[role];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.classes}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}
