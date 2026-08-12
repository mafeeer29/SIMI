import type { RequestStatus } from "./types/request";

const statusConfig: Record<
  RequestStatus,
  {
    label: string;
    classes: string;
    dot: string;
  }
> = {
  PendingVerification: {
    label: "Pendiente de verificación",
    classes: "border-amber-500/20 bg-amber-500/10 text-amber-200",
    dot: "bg-amber-400",
  },

  PendingHolder: {
    label: "Esperando titular",
    classes: "border-sky-500/20 bg-sky-500/10 text-sky-200",
    dot: "bg-sky-400",
  },

  ReadyToAuthorize: {
    label: "Lista para autorizar",
    classes: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
    dot: "bg-emerald-400",
  },

  ReadyToDispute: {
    label: "Lista para bloquear",
    classes: "border-rose-500/20 bg-rose-500/10 text-rose-200",
    dot: "bg-rose-400",
  },

  Authorized: {
    label: "Autorizada",
    classes: "border-emerald-500/20 bg-emerald-500/10 text-emerald-200",
    dot: "bg-emerald-400",
  },

  Disputed: {
    label: "Bloqueada",
    classes: "border-rose-500/20 bg-rose-500/10 text-rose-200",
    dot: "bg-rose-400",
  },
};

export function StatusBadge({
  status,
}: {
  status: RequestStatus;
}) {
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