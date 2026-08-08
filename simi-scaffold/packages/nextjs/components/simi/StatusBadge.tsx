import type { RequestStatus } from "./types/request";

const statusConfig: Record<
  RequestStatus,
  { label: string; classes: string; dot: string }
> = {
  Created: {
    label: "Solicitud creada",
    classes: "bg-sky-500/10 text-sky-200 border border-sky-500/25",
    dot: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]",
  },
  IdentityVerified: {
    label: "Identidad verificada",
    classes: "bg-amber-500/10 text-amber-200 border border-amber-500/30",
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]",
  },
  Authorized: {
    label: "Autorizada",
    classes: "bg-emerald-500/10 text-emerald-200 border border-emerald-500/30",
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
  },
  Disputed: {
    label: "Disputada / bloqueada",
    classes: "bg-rose-500/10 text-rose-200 border border-rose-500/30",
    dot: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]",
  },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
