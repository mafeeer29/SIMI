import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  UserCheck,
  Inbox,
} from "lucide-react";

import type {
  SimRequest,
} from "../types/request";

import { DashboardHeader } from "../DashboardHeader";
import { Button } from "../Button";

interface HolderDashboardProps {
  requests: SimRequest[];

  onConfirm: (
    requestId: `0x${string}`
  ) => Promise<void>;

  onDispute: (
    requestId: `0x${string}`
  ) => Promise<void>;
}

export function HolderDashboard({
  requests,
  onConfirm,
  onDispute,
}: HolderDashboardProps) {
  const pending =
    requests.filter(
      req =>
        req.status ===
          "PendingHolder" ||
        req.status ===
          "ReadyToAuthorize"
    );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <DashboardHeader
        eyebrow="Seguridad de tu línea"
        icon={UserCheck}
        title="Tu línea está protegida"
        subtitle="Aquí puedes revisar operaciones sensibles relacionadas con tu SIM."
        role="Holder"
      />

      {pending.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-16 text-center">
          <Inbox className="mb-4 h-8 w-8 text-emerald-400" />

          <h2 className="text-xl font-bold text-white">
            No tienes solicitudes pendientes
          </h2>

          <p className="mt-2 max-w-sm text-sm text-navy-300">
            Si se solicita una reposición de tu SIM,
            recibirás una alerta para confirmar si
            reconoces la operación.
          </p>
        </div>
      ) : (
        pending.map(req => (
          <div
            key={req.requestId}
            className="card mb-5 overflow-hidden p-6 sm:p-8"
          >
            <div className="mb-6 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 ring-4 ring-amber-500/10">
                <ShieldAlert className="h-8 w-8 text-amber-300" />
              </div>

              <h2 className="text-2xl font-bold text-white">
                Solicitud de reposición de SIM
              </h2>

              <p className="mt-2 max-w-lg text-navy-300">
                Se ha solicitado reemplazar tu SIM.
                Confirma únicamente si tú realizaste
                esta solicitud.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-navy-950/50 p-5">
              <p className="text-xs text-navy-500">
                Solicitud
              </p>

              <p className="mt-1 truncate font-mono text-sm text-white">
                {req.requestId}
              </p>

              <p className="mt-4 text-xs text-navy-500">
                Fecha
              </p>

              <p className="mt-1 text-sm text-white">
                {new Date(
                  req.createdAt
                ).toLocaleString()}
              </p>
            </div>

            {req.status ===
              "PendingHolder" && (
              <div className="mt-6">
                <p className="mb-4 text-center text-lg font-semibold text-white">
                  ¿Reconoces esta solicitud?
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="success"
                    size="lg"
                    className="flex-1"
                    onClick={() =>
                      onConfirm(
                        req.requestId
                      )
                    }
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    Sí, fui yo
                  </Button>

                  <Button
                    variant="danger"
                    size="lg"
                    className="flex-1"
                    onClick={() =>
                      onDispute(
                        req.requestId
                      )
                    }
                  >
                    <XCircle className="h-5 w-5" />
                    No fui yo
                  </Button>
                </div>
              </div>
            )}

            {req.status ===
              "ReadyToAuthorize" && (
              <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] p-5 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-6 w-6 text-emerald-400" />

                <p className="font-semibold text-emerald-200">
                  Confirmación registrada
                </p>

                <p className="mt-1 text-sm text-navy-300">
                  Tu autorización fue firmada.
                  SIMI está listo para registrar el
                  resultado final.
                </p>
              </div>
            )}
          </div>
        ))
      )}

      <div className="mt-5 rounded-2xl border border-white/10 bg-navy-950/40 p-5">
        <p className="font-semibold text-white">
          ¿No reconoces una solicitud?
        </p>

        <p className="mt-1 text-sm text-navy-300">
          Repórtala inmediatamente. SIMI registrará
          la disputa para impedir que la reposición
          pueda ser autorizada con esa solicitud.
        </p>
      </div>
    </div>
  );
}