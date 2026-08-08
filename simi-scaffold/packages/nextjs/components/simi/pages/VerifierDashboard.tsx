import { useState } from "react";
import { ShieldCheck, CheckCircle2, FileCheck, Fingerprint, Inbox } from "lucide-react";
import type { SimRequest, Role } from "../types/request";
import { DashboardHeader } from "../DashboardHeader";
import { Button } from "../Button";
import { StatusBadge } from "../StatusBadge";
import { abbreviateLineId, abbreviateWallet, formatDate } from "../utils/format";

interface VerifierDashboardProps {
  requests: SimRequest[];
  role?: Role;
  onVerifyIdentity: (requestId: number) => void;
}

export function VerifierDashboard({
  requests,
  role,
  onVerifyIdentity,
}: VerifierDashboardProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  const pending = requests.filter((r) => !r.identityVerified && !r.disputed);
  const selected = requests.find((r) => r.id === selectedId);

  const handleVerify = () => {
    if (!selected) return;
    setVerifying(true);
    setTimeout(() => {
      // Web3 callback preserved exactly
      onVerifyIdentity(selected.id);
      setVerifying(false);
      setDone(selected.id);
      setTimeout(() => {
        setDone(null);
        setSelectedId(null);
      }, 2500);
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <DashboardHeader
        eyebrow="Rol: verificador"
        icon={ShieldCheck}
        title="Panel de verificación"
        subtitle="Revisa las solicitudes recién creadas y registra on-chain que la identidad del titular fue validada."
        role={role}
      />

      {/* Off-chain info banner */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] p-5 sm:flex-row sm:items-start">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-300">
          <Fingerprint className="h-5 w-5" />
        </span>
        <div>
          <p className="font-semibold text-amber-100">La verificación de identidad ocurre fuera de la cadena</p>
          <p className="mt-1 text-sm leading-relaxed text-amber-200/80">
            El verificador comprueba la identidad del titular por sus canales habituales (KYC,
            documentación, biometría). La blockchain solo registra el resultado: que el proceso fue
            completado. Ningún dato personal se almacena on-chain.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Pending list */}
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Por verificar</h2>
            <span className="pill">{pending.length}</span>
          </div>
          <div className="space-y-2.5">
            {pending.map((req) => {
              const active = selectedId === req.id;
              return (
                <button
                  key={req.id}
                  onClick={() => {
                    setSelectedId(req.id);
                    setDone(null);
                  }}
                  className={`w-full rounded-2xl border p-4 text-left transition animate-fade-in ${
                    active
                      ? "border-sky-500/50 bg-sky-500/[0.08] ring-1 ring-sky-500/30"
                      : "border-white/10 bg-navy-950/40 hover:border-sky-500/30 hover:bg-navy-900/70"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-navy-400">#{req.id}</span>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="mt-2 truncate font-mono text-sm font-semibold text-white">
                    {abbreviateLineId(req.lineId)}
                  </p>
                  <p className="mt-1 text-xs text-navy-400">
                    Titular {abbreviateWallet(req.holder)}
                  </p>
                </button>
              );
            })}
            {pending.length === 0 && (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-navy-950/40 px-4 py-10 text-center">
                <CheckCircle2 className="mb-2 h-7 w-7 text-emerald-400" />
                <p className="text-sm text-navy-300">Todo verificado. Sin pendientes.</p>
              </div>
            )}
          </div>
        </div>

        {/* Verification panel */}
        <div className="card p-6">
          {!selected ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-navy-950/50 text-navy-400">
                <Inbox className="h-6 w-6" />
              </span>
              <p className="font-medium text-white">Selecciona una solicitud</p>
              <p className="mt-1 max-w-xs text-sm text-navy-400">
                Elige una solicitud de la lista para revisar sus datos y registrar la verificación.
              </p>
            </div>
          ) : done === selected.id ? (
            <div className="flex flex-col items-center py-10 text-center animate-scale-in">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 ring-4 ring-emerald-500/20">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Identidad verificada</h3>
              <p className="mt-1 max-w-xs text-sm text-navy-300">
                La solicitud #{selected.id} quedó registrada como identidad verificada on-chain.
              </p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="mb-5 flex items-center justify-between">
                <span className="font-mono text-xs text-navy-400">Solicitud #{selected.id}</span>
                <StatusBadge status={selected.status} />
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-2xl border border-white/[0.07] bg-navy-950/50 p-4">
                <Field label="Line ID" value={abbreviateLineId(selected.lineId)} mono />
                <Field label="Fecha" value={formatDate(selected.createdAt)} />
                <Field label="Operador" value={abbreviateWallet(selected.operator)} mono />
                <Field label="Titular" value={abbreviateWallet(selected.holder)} mono />
              </div>

              <div className="mt-4 surface p-5">
                <div className="mb-2 flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-amber-300" />
                  <span className="text-sm font-semibold text-white">Validación externa</span>
                </div>
                <p className="text-sm leading-relaxed text-navy-300">
                  Confirma que completaste la verificación de identidad del titular por tus canales
                  autorizados antes de registrarla.
                </p>
              </div>

              <Button className="mt-5 w-full" size="lg" onClick={handleVerify} disabled={verifying}>
                <ShieldCheck className="h-5 w-5" />
                {verifying ? "Registrando en la cadena…" : "Registrar verificación"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-navy-500">{label}</p>
      <p className={`mt-0.5 truncate text-sm text-white ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
