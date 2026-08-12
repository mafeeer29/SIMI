import {
  ShieldCheck,
  Fingerprint,
  CheckCircle2,
} from "lucide-react";

import type {
  SimRequest,
  Role,
} from "../types/request";

import { DashboardHeader } from "../DashboardHeader";
import { Button } from "../Button";

interface VerifierDashboardProps {
  requests: SimRequest[];
  role?: Role;

  onVerifyIdentity: (
    requestId: `0x${string}`
  ) => Promise<void>;
}

export function VerifierDashboard({
  requests,
  role,
  onVerifyIdentity,
}: VerifierDashboardProps) {
  const pending = requests.filter(
    req =>
      req.status ===
      "PendingVerification"
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <DashboardHeader
        eyebrow="Rol: verificador"
        icon={ShieldCheck}
        title="Validación de identidad"
        subtitle="Confirma que la identidad fue validada por los sistemas autorizados de la operadora."
        role={role}
      />

      <div className="mb-6 flex gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] p-5">
        <Fingerprint className="h-6 w-6 shrink-0 text-amber-300" />

        <div>
          <p className="font-semibold text-amber-100">
            Los datos personales permanecen
            fuera de blockchain
          </p>

          <p className="mt-1 text-sm text-amber-200/80">
            DNI, biometría y KYC se verifican
            mediante los sistemas existentes.
            SIMI solo obtiene una firma que acredita
            que la validación fue completada.
          </p>
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Solicitudes pendientes
        </h2>

        {pending.length === 0 ? (
          <div className="py-12 text-center">
            <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-emerald-400" />

            <p className="text-white">
              No hay verificaciones pendientes
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(req => (
              <div
                key={req.requestId}
                className="rounded-2xl border border-white/10 bg-navy-950/40 p-5"
              >
                <p className="text-xs text-navy-400">
                  Solicitud
                </p>

                <p className="mt-1 truncate font-mono text-sm text-white">
                  {req.requestId}
                </p>

                <p className="mt-3 text-xs text-navy-400">
                  Línea
                </p>

                <p className="mt-1 truncate font-mono text-sm text-white">
                  {req.lineId}
                </p>

                <Button
                  className="mt-5"
                  onClick={() =>
                    onVerifyIdentity(
                      req.requestId
                    )
                  }
                >
                  <ShieldCheck className="h-4 w-4" />
                  Firmar validación
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}