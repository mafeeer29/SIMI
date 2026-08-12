import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Inbox,
  LayoutDashboard,
} from "lucide-react";

import { DashboardHeader } from "../DashboardHeader";
import { RequestCard } from "../RequestCard";
import type { Role, SimRequest } from "../types/request";

interface GeneralDashboardProps {
  requests: SimRequest[];
  role?: Role;
}

export function GeneralDashboard({
  requests,
  role,
}: GeneralDashboardProps) {
  const authorized = requests.filter(
    r => r.status === "Authorized",
  ).length;

  const pending = requests.filter(
    r =>
      r.status === "PendingVerification" ||
      r.status === "PendingHolder" ||
      r.status === "ReadyToAuthorize" ||
      r.status === "ReadyToDispute",
  ).length;

  const disputed = requests.filter(
    r => r.status === "Disputed",
  ).length;

  const stats = [
    {
      label: "Totales",
      value: requests.length,
      icon: FileText,
      accent: "text-sky-300",
      ring: "border-sky-500/20 bg-sky-500/10",
    },
    {
      label: "Pendientes",
      value: pending,
      icon: Clock,
      accent: "text-amber-300",
      ring: "border-amber-500/20 bg-amber-500/10",
    },
    {
      label: "Autorizadas",
      value: authorized,
      icon: CheckCircle2,
      accent: "text-emerald-300",
      ring: "border-emerald-500/20 bg-emerald-500/10",
    },
    {
      label: "Disputadas",
      value: disputed,
      icon: AlertTriangle,
      accent: "text-rose-300",
      ring: "border-rose-500/20 bg-rose-500/10",
    },
  ];

  const recent = [...requests]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    )
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <DashboardHeader
        eyebrow="Vista general"
        icon={LayoutDashboard}
        title="Panel de control SIMI"
        subtitle="Estado agregado de las solicitudes de reposición gestionadas por SIMI."
        role={role}
      />

      {/* Métricas */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(stat => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-navy-900/60 p-4 backdrop-blur-md"
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${stat.ring}`}
              >
                <Icon
                  className={`h-5 w-5 ${stat.accent}`}
                />
              </span>

              <div className="min-w-0">
                <p className="text-2xl font-bold leading-none text-white">
                  {stat.value}
                </p>

                <p className="mt-1.5 truncate text-xs text-navy-400">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Solicitudes recientes */}
      <div className="card p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Solicitudes recientes
            </h2>

            <p className="text-sm text-navy-400">
              Últimas solicitudes gestionadas por SIMI
            </p>
          </div>

          <span className="pill">
            {requests.length} en total
          </span>
        </div>

        {recent.length > 0 ? (
          <div className="space-y-2.5">
            {recent.map(req => (
              <RequestCard
                key={req.requestId}
                req={req}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/10 bg-navy-950/40 px-6 py-12 text-center">
            <Inbox className="mb-3 h-8 w-8 text-navy-500" />

            <p className="text-sm text-navy-300">
              Aún no hay solicitudes registradas.
            </p>

            <p className="mt-1 text-xs text-navy-500">
              Las nuevas solicitudes aparecerán aquí.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}