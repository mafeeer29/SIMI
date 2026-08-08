import { useState } from "react";
import { ShieldCheck, CircleCheck as CheckCircle2, FileCheck, Shield, Loader as Loader2 } from "lucide-react";
import type { SimRequest, Role } from "../types/request";
import { DashboardHeader } from "../DashboardHeader";
import { Button } from "../Button";
import { StatusBadge } from "../StatusBadge";
import { StateIllustration } from "../StateIllustration";
import { abbreviateLineId, abbreviateWallet, formatDate } from "../utils/format";

interface VerifierDashboardProps {
  requests: SimRequest[];
  role?: Role;
  isVerifying: boolean;
  onVerifyIdentity: (requestId: number) => void;
}

export function VerifierDashboard({
  requests,
  role,
  isVerifying,
  onVerifyIdentity,
}: VerifierDashboardProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [justVerified, setJustVerified] = useState<number | null>(null);

  const pending = requests.filter(
    (r) => !r.identityVerified && !r.disputed
  );
  const selected = requests.find((r) => r.id === selectedId);

  const handleVerify = () => {
    if (!selected || isVerifying) return;
    onVerifyIdentity(selected.id);
    setJustVerified(selected.id);
    setTimeout(() => {
      setJustVerified(null);
      setSelectedId(null);
    }, 3000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <DashboardHeader
        title="Panel de verificación"
        subtitle="Registra el resultado de una validación de identidad externa."
        role={role}
      />

      {/* Privacy info block */}
      <div className="mb-6 flex items-start gap-4 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 animate-fade-in">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/15">
          <Shield className="h-5 w-5 text-sky-400" />
        </div>
        <div>
          <p className="font-semibold text-white">Privacidad por diseño</p>
          <p className="mt-1 text-sm text-navy-300">
            La identidad se valida fuera de blockchain. SIMI registra únicamente
            el resultado de la verificación.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending list */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">
            Pendientes de verificación ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((req) => (
              <button
                key={req.id}
                onClick={() => {
                  setSelectedId(req.id);
                  setJustVerified(null);
                }}
                className={`card w-full p-4 text-left transition animate-fade-in ${
                  selectedId === req.id
                    ? "border-sky-500/50 ring-1 ring-sky-500/30"
                    : "hover:border-sky-500/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-navy-400">
                    #{req.id}
                  </span>
                  <StatusBadge status={req.status} />
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  <p className="font-semibold text-white">
                    {abbreviateLineId(req.lineId)}
                  </p>
                  <p className="text-xs text-navy-300">
                    Titular: {abbreviateWallet(req.holder)}
                  </p>
                  <p className="text-xs text-navy-400">
                    {formatDate(req.createdAt)}
                  </p>
                </div>
              </button>
            ))}
            {pending.length === 0 && (
              <div className="card p-8 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
                <p className="text-sm text-navy-300">
                  No hay verificaciones pendientes. Todo al día.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Verification panel */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">
            Verificación de identidad
          </h2>
          {!selected ? (
            <div className="card flex flex-col items-center p-10 text-center">
              <StateIllustration state="pending" className="mb-4" />
              <p className="text-sm text-navy-300">
                Selecciona una solicitud pendiente para iniciar la verificación
                de identidad.
              </p>
            </div>
          ) : justVerified === selected.id ? (
            <div className="card flex flex-col items-center p-8 text-center animate-scale-in">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Identidad verificada correctamente
              </h3>
              <p className="mt-1 text-sm text-navy-300">
                La solicitud #{selected.id} ha sido marcada como identidad
                verificada.
              </p>
            </div>
          ) : (
            <div className="card p-6 animate-fade-in">
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-navy-400">
                    Request ID #{selected.id}
                  </span>
                  <StatusBadge status={selected.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-navy-400">Line ID</p>
                    <p className="font-mono text-white">
                      {abbreviateLineId(selected.lineId)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400">Operador</p>
                    <p className="font-mono text-white">
                      {abbreviateWallet(selected.operator)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400">Titular</p>
                    <p className="font-mono text-white">
                      {abbreviateWallet(selected.holder)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400">Fecha</p>
                    <p className="text-white">
                      {formatDate(selected.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-navy-700 bg-navy-950/50 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-amber-400" />
                  <span className="text-sm font-semibold text-white">
                    Validación externa
                  </span>
                </div>
                <p className="text-sm text-navy-300">
                  La verificación de identidad se realiza fuera de la blockchain.
                  La interfaz solo registra que el proceso fue completado.
                </p>
              </div>

              <Button
                className="mt-5 w-full"
                size="lg"
                onClick={handleVerify}
                loading={isVerifying}
              >
                <ShieldCheck className="h-5 w-5" />
                {isVerifying ? "Registrando…" : "Registrar identidad verificada"}
              </Button>

              {isVerifying && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-sky-500/10 px-3 py-2 text-sm text-sky-300">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Confirma la transacción en tu wallet…
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
