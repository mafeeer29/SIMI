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
  const steps: TimelineStep[] = [
    { label: "Solicitud creada", state: "completed" },
    {
      label: "Identidad verificada",
      state: req.identityVerified ? "completed" : "current",
    },
    {
      label: "Confirmación del titular",
      state: req.holderConfirmed
        ? "completed"
        : req.identityVerified && !req.disputed
        ? "current"
        : "pending",
    },
    {
      label: req.disputed ? "Disputada / bloqueada" : "Autorización final",
      state: req.disputed
        ? "completed"
        : req.holderConfirmed
        ? "completed"
        : "pending",
    },
  ];

  if (req.disputed) {
    steps[2].state = "completed";
    steps[2].label = "Disputada";
  }

  return steps;
}
