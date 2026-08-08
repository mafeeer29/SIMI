import type { RequestStatus } from "./types/request";

const statusConfig: Record<
  RequestStatus,
  { label: string; classes: string; dot: string }
> = {
  Created: {
    label: "Solicitud creada",
    classes: "bg-navy-800/70 text-navy-100 border border-navy-700",
    dot: "bg-navy-500",
  },
  IdentityVerified: {
    label: "Identidad verificada",
    classes: "bg-amber-500/15 text-amber-200 border border-amber-500/30",
    dot: "bg-amber-400",
  },
  Authorized: {
    label: "Autorizada",
    classes: "bg-emerald-500/15 text-emerald-200 border border-emerald-500/30",
    dot: "bg-emerald-400",
  },
  Disputed: {
    label: "Disputada / bloqueada",
    classes: "bg-rose-500/15 text-rose-200 border border-rose-500/30",
    dot: "bg-rose-400",
  },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
