import { useState, type FormEvent } from "react";
import { Plus, X, Radio, CheckCircle2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { DashboardHeader } from "../components/DashboardHeader";
import { Button } from "../components/Button";
import { RequestCard } from "../components/RequestCard";

export function OperatorDashboard() {
  const { role, requests, addRequest } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [lineId, setLineId] = useState("");
  const [holder, setHolder] = useState("");
  const [justCreated, setJustCreated] = useState<number | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!lineId.trim() || !holder.trim()) return;
    const nextId = Math.max(0, ...requests.map((r) => r.id)) + 1;
    addRequest({ lineId: lineId.trim(), holder: holder.trim() });
    setJustCreated(nextId);
    setLineId("");
    setHolder("");
    setShowModal(false);
    setTimeout(() => setJustCreated(null), 3000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <DashboardHeader
        title="Solicitudes de reposición de SIM"
        subtitle="Crea y supervisa solicitudes de reposición registradas por el operador."
        role={role}
        actions={
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4" />
            Nueva solicitud
          </Button>
        }
      />

      {justCreated && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 animate-fade-in">
          <CheckCircle2 className="h-4 w-4" />
          Solicitud #{justCreated} creada correctamente.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {requests.map((req) => (
          <RequestCard key={req.id} req={req} />
        ))}
      </div>

      {requests.length === 0 && (
        <div className="card p-12 text-center">
          <Radio className="mx-auto mb-3 h-10 w-10 text-navy-500" />
          <p className="text-navy-300">
            Aún no hay solicitudes. Crea una para comenzar.
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="card-light w-full max-w-md p-6 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy-900">
                Nueva solicitud de reposición
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-navy-400 hover:bg-navy-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy-700">
                  Line Identifier
                </label>
                <input
                  className="input"
                  placeholder="LINE-0x4F2A-9981-AABBCCDD"
                  value={lineId}
                  onChange={(e) => setLineId(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-navy-700">
                  Wallet del titular
                </label>
                <input
                  className="input font-mono"
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
                  className="flex-1 border-navy-200 text-navy-700 hover:bg-navy-50"
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
