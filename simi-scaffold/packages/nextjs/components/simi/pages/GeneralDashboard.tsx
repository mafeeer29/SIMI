import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
} from "lucide-react";
import type { SimRequest, Role } from "../types/request";
import { DashboardHeader } from "../DashboardHeader";
import { RequestCard } from "../RequestCard";

interface GeneralDashboardProps {
  requests: SimRequest[];
  role?: Role;
}

export function GeneralDashboard({ requests, role }: GeneralDashboardProps) {
  const active = requests.filter(
    (r) => r.status !== "Authorized" && r.status !== "Disputed"
  ).length;
  const authorized = requests.filter((r) => r.status === "Authorized").length;
  const pending = requests.filter(
    (r) => r.status === "Created" || r.status === "IdentityVerified"
  ).length;
  const disputed = requests.filter((r) => r.status === "Disputed").length;

  const stats = [
    { label: "Solicitudes activas", value: active, icon: FileText, color: "text-sky-400", bg: "bg-sky-500/10" },
    { label: "Autorizadas", value: authorized, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Pendientes", value: pending, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Disputadas", value: disputed, icon: AlertTriangle, color: "text-rose-400", bg: "bg-rose-500/10" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <DashboardHeader
        title="Dashboard"
        subtitle="Resumen de todas las solicitudes de reposición de SIM"
        role={role}
      />

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card p-5 animate-fade-in">
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-navy-300">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent requests */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Solicitudes recientes
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {requests.map((req) => (
            <RequestCard key={req.id} req={req} />
          ))}
        </div>
      </div>
    </div>
  );
}
