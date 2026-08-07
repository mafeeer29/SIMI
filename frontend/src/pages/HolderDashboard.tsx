import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Clock,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { DashboardHeader } from "../components/DashboardHeader";
import { Button } from "../components/Button";
import { StatusBadge } from "../components/StatusBadge";
import { StateIllustration } from "../components/StateIllustration";
import { Timeline } from "../components/Timeline";
import { abbreviateLineId, abbreviateWallet, formatDate, buildTimeline } from "../utils/format";

type View = "list" | "detail" | "authorized" | "blocked";

export function HolderDashboard() {
  const { requests, updateRequest } = useApp();
  const [view, setView] = useState<View>("list");
  const [selectedId, setSelectedId] = useState<number | null>(null);

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
    updateRequest(selected.id, {
      holderConfirmed: true,
      status: "Authorized",
    });
    setView("authorized");
  };

  const handleDispute = () => {
    if (!selected) return;
    updateRequest(selected.id, {
      disputed: true,
      status: "Disputed",
    });
    setView("blocked");
  };

  const reset = () => {
    setView("list");
    setSelectedId(null);
  };

  // --- LIST VIEW ---
  if (view === "list") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <DashboardHeader
          title="Holder Dashboard"
          subtitle="Review SIM replacement requests linked to your wallet."
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
                <span className="text-xs font-mono text-navy-400">#{req.id}</span>
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
      </div>
    );
  }

  // --- AUTHORIZED VIEW ---
  if (view === "authorized" && selected) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <DashboardHeader
          title="Holder Dashboard"
          role="Holder"
          actions={
            <Button variant="ghost" size="sm" onClick={reset}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          }
        />
        <div className="card flex flex-col items-center p-8 text-center animate-scale-in sm:p-12">
          <StateIllustration state="authorized" className="mb-6" />
          <div className="mb-4 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-300">
              Authorized
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            SIM Replacement Authorized
          </h2>
          <p className="mt-3 max-w-md text-navy-300">
            You confirmed this request. The SIM replacement has been authorized
            and recorded on-chain. Request #{selected.id} is now complete.
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
                <span className="text-navy-400">Status</span>
                <StatusBadge status={selected.status} />
              </div>
            </div>
          </div>
          <Button className="mt-6" size="lg" onClick={reset}>
            Back to requests
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
          title="Holder Dashboard"
          role="Holder"
          actions={
            <Button variant="ghost" size="sm" onClick={reset}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          }
        />
        <div className="card relative flex flex-col items-center overflow-hidden p-8 text-center animate-scale-in sm:p-12">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-rose-500/10 to-transparent" />
          <StateIllustration state="blocked" className="mb-6" />
          <div className="mb-4 flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-4 py-1.5">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            <span className="text-sm font-semibold text-rose-300">
              Security Alert
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            SIM Replacement Blocked
          </h2>
          <p className="mt-3 max-w-md text-navy-300">
            You did not recognize this request. SIMI has blocked the replacement
            and flagged it as disputed. Your SIM remains safe.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-200">
            <ShieldCheck className="h-5 w-5 shrink-0 text-rose-400" />
            SIMI protected your account from a potentially fraudulent SIM swap.
          </div>
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
                <span className="text-navy-400">Status</span>
                <StatusBadge status={selected.status} />
              </div>
            </div>
          </div>
          <Button className="mt-6" size="lg" variant="danger" onClick={reset}>
            Back to requests
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
  const isPending = !selected.identityVerified || !selected.holderConfirmed;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <DashboardHeader
        title="Holder Dashboard"
        role="Holder"
        actions={
          <Button variant="ghost" size="sm" onClick={reset}>
            <ArrowLeft className="h-4 w-4" />
            Back
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
              Pending — awaiting steps
            </span>
          </div>
        </div>
      )}

      {/* Main request card */}
      <div className="card p-6 animate-fade-in sm:p-8">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15">
            <ShieldAlert className="h-5 w-5 text-sky-400" />
          </div>
          <h2 className="text-lg font-bold text-white">
            SIM replacement request detected
          </h2>
        </div>

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
            <p className="text-xs text-navy-400">Operator</p>
            <p className="font-mono text-sm text-white">{selected.operator}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400">Holder</p>
            <p className="font-mono text-sm text-white">
              {abbreviateWallet(selected.holder)}
            </p>
          </div>
          <div>
            <p className="text-xs text-navy-400">Created</p>
            <p className="text-sm text-white">{formatDate(selected.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-navy-400">Identity verified</p>
            <p className="flex items-center gap-1 text-sm">
              {selected.identityVerified ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-300">Yes</span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span className="text-amber-300">Pending</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-6 rounded-xl border border-navy-700 bg-navy-950/30 p-5">
          <p className="mb-4 text-sm font-semibold text-white">
            Process progress
          </p>
          <Timeline steps={timeline} />
        </div>

        {/* Confirmation */}
        {selected.identityVerified && !selected.holderConfirmed && !selected.disputed ? (
          <div className="mt-6">
            <div className="mb-4 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
              <p className="text-center text-base font-semibold text-white">
                Do you recognize this SIM replacement request?
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="success"
                size="lg"
                className="flex-1"
                onClick={handleConfirm}
              >
                <CheckCircle2 className="h-5 w-5" />
                Yes, confirm
              </Button>
              <Button
                variant="danger"
                size="lg"
                className="flex-1"
                onClick={handleDispute}
              >
                <XCircle className="h-5 w-5" />
                I don't recognize this
              </Button>
            </div>
          </div>
        ) : !selected.identityVerified && !selected.disputed ? (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
            Identity verification must be completed before you can confirm or
            dispute this request.
          </div>
        ) : null}
      </div>
    </div>
  );
}
