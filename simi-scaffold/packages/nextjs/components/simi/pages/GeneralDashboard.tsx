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
    {
      label: "Solicitudes",
      value: active,
      detail: "Activas",
      icon: FileText,
      accent: "text-sky-300",
      ring: "bg-sky-500/10",
    },
    {
      label: "Autorizadas",
      value: authorized,
      detail: "Registradas",
      icon: CheckCircle2,
      accent: "text-emerald-300",
      ring: "bg-emerald-500/10",
    },
    {
      label: "Pendientes",
      value: pending,
      detail: "En progreso",
      icon: Clock,
      accent: "text-amber-300",
      ring: "bg-amber-500/10",
    },
    {
      label: "Disputadas",
      value: disputed,
      detail: "Alertas",
      icon: AlertTriangle,
      accent: "text-rose-300",
      ring: "bg-rose-500/10",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <DashboardHeader
        title="Dashboard"
        subtitle="Resumen de solicitudes y estado de autorizaciones de reposición de SIM."
        role={role}
      />

      <div className="mb-8 rounded-[28px] border border-white/10 bg-navy-900/80 p-6 shadow-card">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-navy-300">
              Métricas principales para supervisar el flujo de solicitudes y detectar alertas.
            </p>
          </div>
          <span className="inline-flex rounded-full bg-navy-950/80 px-3 py-2 text-sm text-navy-200">
            {requests.length} solicitudes totales
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-[28px] border border-white/10 bg-navy-950/80 p-5 shadow-sm"
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${stat.ring}`}>
                  <Icon className={`h-5 w-5 ${stat.accent}`} />
                </div>
                <p className="text-3xl font-semibold text-white">{stat.value}</p>
                <p className="mt-2 text-sm text-navy-300">{stat.label}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.24em] text-navy-500">
                  {stat.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-navy-900/80 p-6 shadow-card">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Solicitudes recientes</h2>
            <p className="text-sm text-navy-300">
              Revisa las últimas solicitudes registradas en la blockchain.
            </p>
          </div>
          <span className="rounded-full bg-navy-950/80 px-3 py-2 text-sm text-navy-200">
            {requests.length} items
          </span>
        </div>
        <div className="space-y-3">
          {requests.map((req) => (
            <RequestCard key={req.id} req={req} />
          ))}
        </div>
      </div>
    </div>
  );
}
