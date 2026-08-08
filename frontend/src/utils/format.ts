import type { SimRequest, TimelineStep } from "../types/request";

export function abbreviateLineId(lineId: string): string {
  if (lineId.length <= 14) return lineId;
  return `${lineId.slice(0, 8)}…${lineId.slice(-4)}`;
}

export function abbreviateWallet(wallet: string): string {
  if (wallet.length <= 10) return wallet;
  return `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildTimeline(req: SimRequest): TimelineStep[] {
  if (req.disputed) {
    return [
      { label: "Solicitud creada", state: "completed" },
      { label: "Disputada / bloqueada", state: "completed" },
    ];
  }

  return [
    { label: "Solicitud creada", state: "completed" },
    {
      label: "Identidad verificada",
      state: req.identityVerified ? "completed" : "current",
    },
    {
      label: "Autorizada",
      state: req.status === "Authorized" ? "completed" : "pending",
    },
  ];
}
