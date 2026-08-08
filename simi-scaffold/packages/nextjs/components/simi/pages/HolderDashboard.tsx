import { useState } from "react";
import { ShieldCheck, ShieldAlert, CircleCheck as CheckCircle2, Circle as XCircle, TriangleAlert as AlertTriangle, ArrowLeft, Clock, Loader as Loader2 } from "lucide-react";
import type { SimRequest } from "../types/request";
import { DashboardHeader } from "../DashboardHeader";
import { Button } from "../Button";
import { StatusBadge } from "../StatusBadge";
import { StateIllustration } from "../StateIllustration";
import { Timeline } from "../Timeline";
import {
  abbreviateLineId,
  abbreviateWallet,
  formatDate,
  buildTimeline,
} from "../utils/format";

type View = "list" | "detail" | "authorized" | "blocked";

interface HolderDashboardProps {
  requests: SimRequest[];
  isConfirming: boolean;
  isDisputing: boolean;
  onConfirm: (requestId: number) => void;
  onDispute: (requestId: number) => void;
}

export function HolderDashboard({
  requests,
  isConfirming,
  isDisputing,
  onConfirm,
  onDispute,
}: HolderDashboardProps) {
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

  const handleConfirm = async () => {
    if (!selected || isConfirming) return;
    onConfirm(selected.id);
  };

  const handleDispute = async () => {
    if (!selected || isDisputing) return;
    onDispute(selected.id);
  };

  const reset = () => {
    setView("list");
    setSelectedId(null);
  };

  const isBusy = isConfirming || isDisputing;

  // --- LIST VIEW ---
  if (view === "list") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <DashboardHeader
          title="Panel del titular"
          subtitle="Revisa las solicitudes de reposición de SIM vinculadas a tu wallet."
          role="Holder"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {requests.map((req) => (
            <button
              key={req.id}
              onClick={() => openDetail(req.id)}
              className="card w-full p-4 text-left transition hover:border-sky-500/40 hover:bg-navy-900/90 animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-navy-400">
                  #{req.id}
                </span>
                <StatusBadge status={req.status} />
              </div>
              <p className="mt-2 font-semibold text-white">
                {abbreviateLineId(req.lineId)}
              </p>
              <p className="mt-1 text-xs text-navy-300">
                {formatDate(req.createdAt)}
              </p>
            </button>
          ))}
        </div>
        {requests.length === 0 && (
          <div className="card p-12 text-center">
            <ShieldCheck className="mx-auto mb-3 h-10 w-10 text-navy-500" />
            <p className="text-navy-300">
              No hay solicitudes de reposición vinculadas a tu wallet.
            </p>
          </div>
        )}
      </div>
    );
  }

  // --- AUTHORIZED VIEW ---
  if (view === "authorized" && selected) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <DashboardHeader
          title="Panel del titular"
          role="Holder"
          actions={
            <Button variant="ghost" size="sm" onClick={reset}>
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          }
        />
        <div className="card flex flex-col items-center p-8 text-center animate-scale-in sm:p-12">
          <StateIllustration state="authorized" className="mb-6" />
          <div className="mb-4 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-300">
              Autorizada
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Reposición autorizada
          </h2>
          <p className="mt-3 max-w-md text-navy-300">
            Las condiciones requeridas se cumplieron y la autorización quedó
            registrada on-chain. La solicitud #{selected.id} está completa.
          </p>
          <div className="mt-6 w-full max-w-sm rounded-xl border border-navy-700 bg-navy-950/50 p-4 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-400">Request ID</span>
                <span className="font-mono text-white">#{selected.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-400">Line ID</span>
                <span className="font-mono text-white">
                  {abbreviateLineId(selected.lineId)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-400">Fecha</span>
                <span className="text-white">
                  {formatDate(selected.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-400">Estado</span>
                <StatusBadge status={selected.status} />
              </div>
            </div>
          </div>
          <Button className="mt-6" size="lg" onClick={reset}>
            Volver a las solicitudes
          </Button>
        </div>
      </div>
    );
  }

  // --- BLOCKED VIEW ---
  if (view === "blocked" && selected) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <DashboardHeader
          title="Panel del titular"
          role="Holder"
          actions={
            <Button variant="ghost" size="sm" onClick={reset}>
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          }
        />
        <div className="card relative flex flex-col items-center overflow-hidden p-8 text-center animate-scale-in sm:p-12">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-rose-500/10 to-transparent" />
          <StateIllustration state="blocked" className="mb-6" />
          <div className="mb-4 flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            <span className="text-sm font-semibold text-rose-300">Disputada</span>
          </div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Reposición bloqueada
          </h2>
          <p className="mt-3 max-w-md text-navy-300">
            El titular no reconoció esta solicitud. SIMI registró la disputa y
            el smart contract bloqueó su autorización.
          </p>
          <div className="mt-6 w-full max-w-sm rounded-xl border border-navy-700 bg-navy-950/50 p-4 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-navy-400">Request ID</span>
                <span className="font-mono text-white">#{selected.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-400">Line ID</span>
                <span className="font-mono text-white">
                  {abbreviateLineId(selected.lineId)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-400">Fecha</span>
                <span className="text-white">
                  {formatDate(selected.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-navy-400">Estado</span>
                <StatusBadge status={selected.status} />
              </div>
            </div>
          </div>
          <Button className="mt-6" size="lg" variant="danger" onClick={reset}>
            Volver a las solicitudes
          </Button>
        </div>
      </div>
    );
  }

  // --- DETAIL VIEW ---
  if (!selected) {
    return null;
  }

  const timeline = buildTimeline(selected);
  const isPending = !selected.identityVerified;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <DashboardHeader
        title="Panel del titular"
        role="Holder"
        actions={
          <Button variant="ghost" size="sm" onClick={reset}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        }
      />

      {/* Pending illustration */}
      {isPending && (
        <div className="mb-6 flex flex-col items-center animate-fade-in">
          <StateIllustration state="pending" className="mb-3" />
          <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5">
            <Clock className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-300">
              Verificación de identidad pendiente
            </span>
          </div>
          <p className="mt-2 max-w-sm text-center text-sm text-navy-300">
            Esta solicitud todavía requiere la validación de identidad antes de
            poder ser autorizada.
          </p>
        </div>
      )}

      {/* Main request card */}
      <div className="card p-6 animate-fade-in sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15">
            <ShieldAlert className="h-5 w-5 text-sky-400" />
          </div>
          <h2 className="text-lg font-bold text-white">
            Solicitud de reposición detectada
          </h2>
        </div>

        <p className="mb-5 text-sm text-navy-300">
          Revisa los datos antes de decidir si reconoces esta solicitud.
        </p>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-navy-700 bg-navy-950/40 p-4">
          <div>
            <p className="text-xs text-navy-400">Request ID</p>
            <p className="font-mono text-sm text-white">#{selected.id}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400">Line ID</p>
            <p className="font-mono text-sm text-white">
              {abbreviateLineId(selected.lineId)}
            </p>
          </div>
          <div>
            <p className="text-xs text-navy-400">Operador</p>
            <p className="font-mono text-sm text-white">
              {abbreviateWallet(selected.operator)}
            </p>
          </div>
          <div>
            <p className="text-xs text-navy-400">Titular</p>
            <p className="font-mono text-sm text-white">
              {abbreviateWallet(selected.holder)}
            </p>
          </div>
          <div>
            <p className="text-xs text-navy-400">Fecha</p>
            <p className="text-sm text-white">
              {formatDate(selected.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-navy-400">Identidad verificada</p>
            <p className="flex items-center gap-1 text-sm">
              {selected.identityVerified ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-300">Sí</span>
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
        <div className="mt-6 rounded-xl border border-navy-700 bg-navy-950/30 p-5">
          <p className="mb-4 text-sm font-semibold text-white">
            Progreso del proceso
          </p>
          <Timeline steps={timeline} />
        </div>

        {/* Confirmation actions */}
        {selected.identityVerified &&
        selected.status === "IdentityVerified" ? (
          <div className="mt-6">
            <div className="mb-4 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
              <p className="text-center text-base font-semibold text-white">
                ¿Reconoces esta solicitud?
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="success"
                size="lg"
                className="flex-1"
                onClick={() => setConfirming(true)}
                disabled={isBusy}
              >
                <CheckCircle2 className="h-5 w-5" />
                Sí, reconozco esta solicitud
              </Button>
              <Button
                variant="danger"
                size="lg"
                className="flex-1"
                onClick={() => setDisputing(true)}
                disabled={isBusy}
              >
                <XCircle className="h-5 w-5" />
                No reconozco esta solicitud
              </Button>
            </div>
          </div>
        ) : !selected.identityVerified && !selected.disputed ? (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
            La verificación de identidad debe completarse antes de que puedas
            confirmar o disputar esta solicitud.
          </div>
        ) : null}
      </div>

      {/* Confirm modal */}
      {confirming && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="card-light w-full max-w-md p-6 animate-scale-in">
            <h3 className="text-lg font-bold text-navy-900">
              Confirmar reposición
            </h3>
            <p className="mt-4 text-sm text-navy-600">
              Al confirmar, autorizas esta solicitud de reposición de SIM.
              Confirma únicamente si reconoces esta solicitud.
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                className="flex-1"
                onClick={handleConfirm}
                loading={isConfirming}
                disabled={isBusy}
              >
                {isConfirming ? "Procesando…" : "Confirmar y autorizar"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-navy-200 text-navy-700 hover:bg-navy-50"
                onClick={() => setConfirming(false)}
                disabled={isBusy}
              >
                Cancelar
              </Button>
            </div>
            {isConfirming && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirma la transacción en tu wallet…
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dispute modal */}
      {disputing && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-sm animate-fade-in">
          <div className="card-light w-full max-w-md p-6 animate-scale-in">
            <h3 className="text-lg font-bold text-navy-900">
              Disputar solicitud
            </h3>
            <p className="mt-1 text-sm font-semibold text-rose-600">
              No reconozco esta solicitud
            </p>
            <p className="mt-3 text-sm text-navy-600">
              Esta acción registrará la solicitud como disputada e impedirá su
              autorización según las reglas del smart contract.
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleDispute}
                loading={isDisputing}
                disabled={isBusy}
              >
                {isDisputing ? "Procesando…" : "Disputar y bloquear"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-navy-200 text-navy-700 hover:bg-navy-50"
                onClick={() => setDisputing(false)}
                disabled={isBusy}
              >
                Cancelar
              </Button>
            </div>
            {isDisputing && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirma la transacción en tu wallet…
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
