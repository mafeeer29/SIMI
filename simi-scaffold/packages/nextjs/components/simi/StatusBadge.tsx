import type { RequestStatus } from "./types/request";

const statusConfig: Record<
  RequestStatus,
  { label: string; classes: string; dot: string }
> = {
  Created: {
    label: "Solicitud creada",
    classes: "bg-navy-100 text-navy-700 border-navy-200",
    dot: "bg-navy-500",
  },
  IdentityVerified: {
    label: "Identidad verificada",
    classes: "bg-amber-100 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
  },
  Authorized: {
    label: "Autorizada",
    classes: "bg-emerald-100 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
  },
  Disputed: {
    label: "Disputada / bloqueada",
    classes: "bg-rose-100 text-rose-800 border-rose-200",
    dot: "bg-rose-500",
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
