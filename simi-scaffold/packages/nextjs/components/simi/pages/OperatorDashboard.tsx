import { useState, type FormEvent } from "react";
import {
  Plus,
  X,
  Radio,
  CheckCircle2,
  Signal,
  Bell,
} from "lucide-react";

import type {
  SimRequest,
  CreateRequestInput,
  Role,
} from "../types/request";

import { DashboardHeader } from "../DashboardHeader";
import { Button } from "../Button";

interface OperatorDashboardProps {
  requests: SimRequest[];
  role?: Role;

  onCreateRequest: (
    input: CreateRequestInput
  ) => Promise<void>;

  onSendAlert: (
    requestId: `0x${string}`
  ) => void;
}

export function OperatorDashboard({
  requests,
  role,
  onCreateRequest,
  onSendAlert,
}: OperatorDashboardProps) {
  const [showModal, setShowModal] =
    useState(false);

  const [lineId, setLineId] =
    useState("");

  const [holder, setHolder] =
    useState("");

  const [creating, setCreating] =
    useState(false);

  const handleSubmit = async (
    e: FormEvent
  ) => {
    e.preventDefault();

    if (
      !lineId.trim() ||
      !holder.trim()
    ) {
      return;
    }

    try {
      setCreating(true);

      await onCreateRequest({
        lineId: lineId.trim(),
        holder: holder.trim(),
      });

      setLineId("");
      setHolder("");
      setShowModal(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <DashboardHeader
        eyebrow="Rol: operadora"
        icon={Radio}
        title="Gestión de reposiciones"
        subtitle="Inicia solicitudes de reposición y supervisa el proceso de autorización."
        role={role}
        actions={
          <Button
            onClick={() =>
              setShowModal(true)
            }
          >
            <Plus className="h-4 w-4" />
            Nueva solicitud
          </Button>
        }
      />

      <div className="mb-6 rounded-2xl border border-sky-500/20 bg-sky-500/[0.06] p-5">
        <p className="font-semibold text-white">
          Blockchain simplificada
        </p>

        <p className="mt-1 text-sm text-navy-300">
          La solicitud y sus validaciones se gestionan
          fuera de la cadena. Blockchain registra solo
          el resultado crítico final.
        </p>
      </div>

      <div className="card p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">
            Solicitudes
          </h2>

          <span className="pill">
            {requests.length} solicitudes
          </span>
        </div>

        {requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map(req => (
              <div
                key={req.requestId}
                className="rounded-2xl border border-white/10 bg-navy-950/40 p-5"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs text-navy-400">
                      Solicitud
                    </p>

                    <p className="mt-1 max-w-sm truncate font-mono text-sm text-white">
                      {req.requestId}
                    </p>

                    <p className="mt-3 text-xs text-navy-400">
                      Titular
                    </p>

                    <p className="mt-1 font-mono text-sm text-navy-200">
                      {req.holder.slice(0, 8)}
                      ...
                      {req.holder.slice(-6)}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <StatusLabel
                      status={req.status}
                    />

                    {!req.alertSent &&
                      req.status !==
                        "Authorized" &&
                      req.status !==
                        "Disputed" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            onSendAlert(
                              req.requestId
                            )
                          }
                        >
                          <Bell className="h-4 w-4" />
                          Enviar alerta
                        </Button>
                      )}

                    {req.alertSent && (
                      <span className="flex items-center gap-1 text-xs text-emerald-300">
                        <CheckCircle2 className="h-4 w-4" />
                        Alerta enviada
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-navy-950/40 px-6 py-14 text-center">
            <Signal className="mb-4 h-7 w-7 text-sky-300" />

            <p className="font-medium text-white">
              Aún no hay solicitudes
            </p>

            <p className="mt-1 max-w-sm text-sm text-navy-400">
              Crea una solicitud para iniciar el
              proceso de reposición de SIM.
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-sm"
          onClick={() =>
            setShowModal(false)
          }
        >
          <div
            className="modal-panel w-full max-w-md p-6"
            onClick={e =>
              e.stopPropagation()
            }
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Nueva solicitud
                </h2>

                <p className="text-xs text-navy-400">
                  Reposición de SIM
                </p>
              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="text-navy-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-semibold text-white">
                  Identificador de línea
                </label>

                <input
                  className="input-dark"
                  placeholder="SIMI-LINE-001"
                  value={lineId}
                  onChange={e =>
                    setLineId(
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-white">
                  Wallet del titular
                </label>

                <input
                  className="input-dark font-mono"
                  placeholder="0x..."
                  value={holder}
                  onChange={e =>
                    setHolder(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  type="button"
                  className="flex-1"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  className="flex-1"
                  disabled={creating}
                >
                  {creating
                    ? "Creando..."
                    : "Crear solicitud"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusLabel({
  status,
}: {
  status: SimRequest["status"];
}) {
  const labels: Record<SimRequest["status"], string> = {
    PendingVerification: "Pendiente de verificación",
    PendingHolder: "Esperando titular",
    ReadyToAuthorize: "Lista para autorización",
    ReadyToDispute: "Lista para bloquear",
    Authorized: "Autorizada",
    Disputed: "Bloqueada",
  };

  return (
    <span className="pill">
      {labels[status]}
    </span>
  );
}