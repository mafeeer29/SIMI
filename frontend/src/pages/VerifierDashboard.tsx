import { useState } from "react";
import { ShieldCheck, CheckCircle2, FileCheck } from "lucide-react";
import { useApp } from "../context/AppContext";
import { DashboardHeader } from "../components/DashboardHeader";
import { Button } from "../components/Button";
import { StatusBadge } from "../components/StatusBadge";
import { StateIllustration } from "../components/StateIllustration";
import { abbreviateLineId, abbreviateWallet, formatDate } from "../utils/format";

export function VerifierDashboard() {
  const { requests, updateRequest } = useApp();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [done, setDone] = useState<number | null>(null);

  const pending = requests.filter((r) => !r.identityVerified && !r.disputed);
  const selected = requests.find((r) => r.id === selectedId);

  const handleVerify = () => {
    if (!selected) return;
    setVerifying(true);
    setTimeout(() => {
      updateRequest(selected.id, {
        identityVerified: true,
        status: "IdentityVerified",
      });
      setVerifying(false);
      setDone(selected.id);
      setTimeout(() => {
        setDone(null);
        setSelectedId(null);
      }, 2500);
    }, 1200);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <DashboardHeader
        title="Identity Verification"
        subtitle="Review and verify the identity of SIM replacement request holders."
        role="Verifier"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending list */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">
            Pending verification ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((req) => (
              <button
                key={req.id}
                onClick={() => {
                  setSelectedId(req.id);
                  setDone(null);
                }}
                className={`card w-full p-4 text-left transition animate-fade-in ${
                  selectedId === req.id
                    ? "border-sky-500/50 bg-navy-900/90 ring-1 ring-sky-500/30"
                    : "hover:border-sky-500/30 hover:bg-navy-900/80"
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
                    Holder: {abbreviateWallet(req.holder)}
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
                  No pending verifications. All caught up.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Verification panel */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white">
            Identity Verification
          </h2>
          {!selected ? (
            <div className="card flex flex-col items-center p-10 text-center">
              <StateIllustration state="pending" className="mb-4" />
              <p className="text-sm text-navy-300">
                Select a pending request to begin identity verification.
              </p>
            </div>
          ) : done === selected.id ? (
            <div className="card flex flex-col items-center p-8 text-center animate-scale-in">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Identity verification completed successfully
              </h3>
              <p className="mt-1 text-sm text-navy-300">
                Request #{selected.id} has been marked as identity verified.
              </p>
            </div>
          ) : (
            <div className="card p-6 animate-fade-in">
              {/* Request details */}
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-navy-400">
                    Request #{selected.id}
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
                    <p className="text-xs text-navy-400">Operator</p>
                    <p className="font-mono text-white">{selected.operator}</p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400">Holder</p>
                    <p className="font-mono text-white">
                      {abbreviateWallet(selected.holder)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-navy-400">Created</p>
                    <p className="text-white">
                      {formatDate(selected.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification block */}
              <div className="rounded-xl border border-navy-700 bg-navy-950/50 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-amber-400" />
                  <span className="text-sm font-semibold text-white">
                    Verification check
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    "Document authenticity validated",
                    "Biometric match confirmed",
                    "Holder KYC record verified",
                  ].map((check) => (
                    <div
                      key={check}
                      className="flex items-center gap-2 text-sm text-navy-200"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      {check}
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                  Identity verification completed successfully
                </div>
              </div>

              <Button
                className="mt-5 w-full"
                size="lg"
                onClick={handleVerify}
                disabled={verifying}
              >
                <ShieldCheck className="h-5 w-5" />
                {verifying ? "Recording…" : "Record Verification"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
