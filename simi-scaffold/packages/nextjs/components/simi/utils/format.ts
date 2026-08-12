import type {
  SimRequest,
  TimelineStep,
} from "../types/request";

export function abbreviateWallet(
  wallet: string,
) {
  if (!wallet) return "-";

  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}

export function abbreviateLineId(
  lineId: string,
) {
  if (!lineId) return "-";

  return `${lineId.slice(0, 10)}...${lineId.slice(-6)}`;
}

export function formatDate(
  date: string,
) {
  return new Date(date).toLocaleString();
}

export function buildTimeline(
  req: SimRequest,
): TimelineStep[] {
  const isDisputed =
    req.status === "ReadyToDispute" ||
    req.status === "Disputed";

  const verificationComplete =
    req.status !== "PendingVerification";

  const holderComplete =
    req.status === "ReadyToAuthorize" ||
    req.status === "ReadyToDispute" ||
    req.status === "Authorized" ||
    req.status === "Disputed";

  const finalized =
    req.status === "Authorized" ||
    req.status === "Disputed";

  return [
    {
      label: "Solicitud creada",
      description: "La operadora inició la solicitud.",
      state: "completed",
    },

    {
      label: "Identidad verificada",
      description:
        "El verificador registró su firma de validación.",
      state: verificationComplete
        ? "completed"
        : "current",
    },

    {
      label: isDisputed
        ? "Solicitud rechazada"
        : "Confirmación del titular",
      description: isDisputed
        ? "El titular indicó que no reconoce la solicitud."
        : "El titular confirma o rechaza la solicitud.",
      state: isDisputed
        ? "disputed"
        : holderComplete
          ? "completed"
          : verificationComplete
            ? "current"
            : "pending",
    },

    {
      label: isDisputed
        ? "Reposición bloqueada"
        : "Registro final",
      description: isDisputed
        ? "La reposición queda bloqueada."
        : "El resultado final se registra en blockchain.",
      state: finalized
        ? isDisputed
          ? "disputed"
          : "completed"
        : holderComplete
          ? "current"
          : "pending",
    },
  ];
}