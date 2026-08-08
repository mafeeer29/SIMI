import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Clock,
  UserCheck,
  Inbox,
} from "lucide-react";
import type { SimRequest } from "../types/request";
import { DashboardHeader } from "../DashboardHeader";
import { Button } from "../Button";
import { StatusBadge } from "../StatusBadge";
import { StateIllustration } from "../StateIllustration";
import { Timeline } from "../Timeline";
import { abbreviateLineId, abbreviateWallet, formatDate, buildTimeline } from "../utils/format";

type View = "list" | "detail" | "authorized" | "blocked";

interface HolderDashboardProps {
  requests: SimRequest[];
  onConfirm: (requestId: number) => void;
  onDispute: (requestId: number) => void;
}

export function HolderDashboard({ requests, onConfirm, onDispute }: HolderDashboardProps) {
  const [view, setView] = useState<View>("list");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [disputing, setDisputing] = useState(false);

  const selected = requests.find((r) => r.id === selectedId);

  const openDetail = (id: number) => {
    setSelectedId(id);
    const req = requests.find((r) => r.id === id);
    if (req?.status === "Authorized") setView("authorized");
    else if (req?.status === "Disputed") setView("blocked");
    else setView("detail");
  };

  const handleConfirm = () => {
    if (!selected) return;
    onConfirm(selected.id);
    setConfirming(false);
    setView("authorized");
  };

  const handleDispute = () => {
    if (!selected) return;
    onDispute(selected.id);
    setDisputing(false);
    setView("blocked");
  };

  const reset = () => {
    setView("list");
    setSelectedId(null);
  };

  /* -------------------------------------------------- LIST VIEW */
  if (view === "list") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <DashboardHeader
          eyebrow="Rol: titular de línea"
          icon={UserCheck}
          title="Panel del titular"
          subtitle="Revisa las solicitudes de reposición vinculadas a tu línea y decide si las reconoces."
          role="Holder"
        />

        {requests.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {requests.map((req) => (
              <button
                key={req.id}
                onClick={() => openDetail(req.id)}
                className="card card-hover animate-fade-in w-full p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-navy-400">#{req.id}</span>
                  <StatusBadge status={req.status} />
                </div>
                <p className="mt-3 truncate font-mono font-semibold text-white">
                  {abbreviateLineId(req.lineId)}
                </p>
                <p className="mt-1 text-xs text-navy-400">{formatDate(req.createdAt)}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="card flex flex-col items-center px-6 py-16 text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-navy-950/50 text-navy-400">
              <Inbox className="h-6 w-6" />
            </span>
            <p className="font-medium text-white">No hay solicitudes para tu línea</p>
            <p className="mt-1 max-w-xs text-sm text-navy-400">
              Si alguien intenta reponer tu SIM, la verás aquí para reconocerla o bloquearla.
            </p>
          </div>
        )}
      </div>
    );
  }

  /* -------------------------------------------------- AUTHORIZED VIEW */
  if (view === "authorized" && selected) {
    return (
      <ResultShell onBack={reset}>
        <div className="card flex flex-col items-center p-8 text-center animate-scale-in sm:p-12">
          <StateIllustration state="authorized" className="mb-6" />
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-300">Autorizada</span>
          </div>
          <h2 className="text-2xl font-bold text-white text-balance sm:text-3xl">
            Reposición autorizada
          </h2>
          <p className="mt-3 max-w-md text-pretty text-navy-300">
            Reconociste esta solicitud. Se cumplieron todas las condiciones y la reposición quedó
            autorizada y registrada on-chain.
          </p>
          <SummaryCard req={selected} />
          <Button className="mt-6" size="lg" onClick={reset}>
            Volver a mis solicitudes
          </Button>
        </div>
      </ResultShell>
    );
  }

  /* -------------------------------------------------- BLOCKED VIEW */
  if (view === "blocked" && selected) {
    return (
      <ResultShell onBack={reset}>
        <div className="card relative flex flex-col items-center overflow-hidden p-8 text-center animate-scale-in sm:p-12">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-rose-500/10 to-transparent" />
          <StateIllustration state="blocked" className="mb-6" />
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            <span className="text-sm font-semibold text-rose-300">Alerta de seguridad</span>
          </div>
          <h2 className="text-2xl font-bold text-white text-balance sm:text-3xl">
            Reposición bloqueada
          </h2>
          <p className="mt-3 max-w-md text-pretty text-navy-300">
            No reconociste esta solicitud, así que SIMI la marcó como disputada y bloqueó la
            reposición. Tu SIM permanece segura.
          </p>
          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-200">
            <ShieldCheck className="h-5 w-5 shrink-0 text-rose-400" />
            SIMI protegió tu cuenta de una posible reposición fraudulenta.
          </div>
          <SummaryCard req={selected} />
          <Button className="mt-6" size="lg" variant="danger" onClick={reset}>
            Volver a mis solicitudes
          </Button>
        </div>
      </ResultShell>
    );
  }

  /* -------------------------------------------------- DETAIL VIEW */
  if (!selected) return null;

  const timeline = buildTimeline(selected);
  const awaitingIdentity = !selected.identityVerified && !selected.disputed;
  const canDecide = selected.identityVerified && !selected.holderConfirmed && !selected.disputed;

  return (
    <ResultShell onBack={reset}>
      {/* Pending hero */}
      <div className="mb-6 flex flex-col items-center animate-fade-in">
        <StateIllustration state="pending" className="mb-4" />
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5">
          <Clock className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold text-amber-300">
            Solicitud pendiente de tu decisión
          </span>
        </div>
      </div>

      <div className="card p-6 animate-fade-in sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10">
            <ShieldAlert className="h-5 w-5 text-sky-300" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-white">Reposición de SIM detectada</h2>
            <p className="text-xs text-navy-400">Revisa los datos antes de decidir</p>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-2xl border border-white/[0.07] bg-navy-950/50 p-4">
          <Field label="Solicitud" value={`#${selected.id}`} mono />
          <Field label="Line ID" value={abbreviateLineId(selected.lineId)} mono />
          <Field label="Operador" value={abbreviateWallet(selected.operator)} mono />
          <Field label="Titular" value={abbreviateWallet(selected.holder)} mono />
          <Field label="Fecha" value={formatDate(selected.createdAt)} />
          <div className="min-w-0">
            <p className="text-xs text-navy-500">Identidad</p>
            <p className="mt-0.5 flex items-center gap-1 text-sm">
              {selected.identityVerified ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-300">Verificada</span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span className="text-amber-300">Pendiente</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-5 surface p-5">
          <p className="mb-4 text-sm font-semibold text-white">Progreso del proceso</p>
          <Timeline steps={timeline} />
        </div>

        {/* Decision */}
        {canDecide ? (
          <div className="mt-6">
            <div className="mb-4 rounded-2xl border border-sky-500/25 bg-sky-500/[0.07] p-4 text-center">
              <p className="text-base font-semibold text-white">¿Reconoces esta solicitud?</p>
              <p className="mt-1 text-xs text-navy-300">
                Confirma solo si tú solicitaste esta reposición de SIM.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="success"
                size="lg"
                className="flex-1"
                onClick={() => setConfirming(true)}
              >
                <CheckCircle2 className="h-5 w-5" />
                Sí, reconozco esta solicitud
              </Button>
              <Button
                variant="danger"
                size="lg"
                className="flex-1"
                onClick={() => setDisputing(true)}
              >
                <XCircle className="h-5 w-5" />
                No reconozco esta solicitud
              </Button>
            </div>
          </div>
        ) : awaitingIdentity ? (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
            La verificación de identidad debe completarse antes de que puedas reconocer o rechazar
            esta solicitud.
          </div>
        ) : null}
      </div>

      {/* Confirm modal */}
      {confirming && selected && (
        <ConfirmModal
          title="Reconocer y autorizar"
          description="Al reconocer esta solicitud autorizas la reposición de SIM. Continúa solo si tú la solicitaste."
          confirmLabel="Sí, autorizar"
          onConfirm={handleConfirm}
          onCancel={() => setConfirming(false)}
        />
      )}

      {/* Dispute modal */}
      {disputing && selected && (
        <ConfirmModal
          danger
          title="Rechazar y bloquear"
          description="Al rechazar, la solicitud se marcará como disputada y la reposición quedará bloqueada on-chain."
          confirmLabel="Sí, bloquear"
          onConfirm={handleDispute}
          onCancel={() => setDisputing(false)}
        />
      )}
    </ResultShell>
  );
}

/* -------------------------------------------------- Helpers */

function ResultShell({ children, onBack }: { children: React.ReactNode; onBack: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <DashboardHeader
        eyebrow="Rol: titular de línea"
        icon={UserCheck}
        title="Panel del titular"
        role="Holder"
        actions={
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        }
      />
      {children}
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

function SummaryCard({ req }: { req: SimRequest }) {
  return (
    <div className="mt-6 w-full max-w-sm rounded-2xl border border-white/[0.07] bg-navy-950/50 p-4 text-left">
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-navy-400">Solicitud</span>
          <span className="font-mono text-white">#{req.id}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-navy-400">Line ID</span>
          <span className="truncate font-mono text-white">{abbreviateLineId(req.lineId)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-navy-400">Estado</span>
          <StatusBadge status={req.status} />
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  description,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div className="modal-panel w-full max-w-md p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center gap-3">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
              danger
                ? "border-rose-500/25 bg-rose-500/10 text-rose-300"
                : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            {danger ? <ShieldAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </span>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <p className="text-sm leading-relaxed text-navy-300">{description}</p>
        <div className="mt-6 flex gap-3">
          <Button
            variant={danger ? "danger" : "success"}
            className="flex-1"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
