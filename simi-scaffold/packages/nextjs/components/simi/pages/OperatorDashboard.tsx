import { useState, type FormEvent } from "react";
import { Plus, X, Radio, CheckCircle2, Signal } from "lucide-react";
import type { SimRequest, CreateRequestInput, Role } from "../types/request";
import { DashboardHeader } from "../DashboardHeader";
import { Button } from "../Button";
import { RequestCard } from "../RequestCard";

interface OperatorDashboardProps {
  requests: SimRequest[];
  role?: Role;
  onCreateRequest: (input: CreateRequestInput) => void;
  onSelectRequest: (requestId: number) => void;
}

export function OperatorDashboard({
  requests,
  role,
  onCreateRequest,
  onSelectRequest,
}: OperatorDashboardProps) {
  const [showModal, setShowModal] = useState(false);
  const [lineId, setLineId] = useState("");
  const [holder, setHolder] = useState("");
  const [justCreated, setJustCreated] = useState<number | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!lineId.trim() || !holder.trim()) return;
    const nextId = Math.max(0, ...requests.map((r) => r.id)) + 1;
    // Web3 callback preserved exactly
    onCreateRequest({ lineId: lineId.trim(), holder: holder.trim() });
    setJustCreated(nextId);
    setLineId("");
    setHolder("");
    setShowModal(false);
    setTimeout(() => setJustCreated(null), 3000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <DashboardHeader
        eyebrow="Rol: operador"
        icon={Radio}
        title="Panel del operador"
        subtitle="Registra nuevas solicitudes de reposición de SIM y supervisa su avance on-chain."
        role={role}
        actions={
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" />
            Nueva solicitud
          </Button>
        }
      />

      {justCreated && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200 animate-fade-in">
          <CheckCircle2 className="h-4 w-4" />
          Solicitud #{justCreated} enviada a la blockchain.
        </div>
      )}

      <div className="card p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Solicitudes registradas</h2>
          <span className="pill">{requests.length} solicitudes</span>
        </div>

        {requests.length > 0 ? (
          <div className="space-y-2.5">
            {requests.map((req) => (
              <RequestCard key={req.id} req={req} onClick={onSelectRequest} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-navy-950/40 px-6 py-14 text-center">
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10">
              <Signal className="h-6 w-6 text-sky-300" />
            </span>
            <p className="font-medium text-white">Aún no hay solicitudes</p>
            <p className="mt-1 max-w-xs text-sm text-navy-400">
              Crea la primera solicitud de reposición para iniciar el flujo de autorización.
            </p>
            <Button className="mt-5" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4" />
              Nueva solicitud
            </Button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="modal-panel w-full max-w-md p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-300">
                  <Radio className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-white">Nueva solicitud</h2>
                  <p className="text-xs text-navy-400">Reposición de SIM</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-navy-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy-100">
                  Identificador de línea
                </label>
                <input
                  className="input-dark font-mono"
                  placeholder="LINE-0x4F2A-9981"
                  value={lineId}
                  onChange={(e) => setLineId(e.target.value)}
                  required
                />
                <p className="mt-1.5 text-xs text-navy-500">Máximo 32 bytes. Se codifica on-chain.</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy-100">
                  Wallet del titular
                </label>
                <input
                  className="input-dark font-mono"
                  placeholder="0x9B2c…44E1"
                  value={holder}
                  onChange={(e) => setHolder(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  Crear solicitud
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
