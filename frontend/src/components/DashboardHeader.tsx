import type { ReactNode } from "react";
import { Wallet } from "lucide-react";
import type { Role } from "../types/request";
import { RoleBadge } from "./RoleBadge";
import { useApp } from "../context/AppContext";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  role?: Role;
  actions?: ReactNode;
}

export function DashboardHeader({
  title,
  subtitle,
  role = "Operator",
  actions,
}: DashboardHeaderProps) {
  const { walletConnected, walletAddress } = useApp();
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-navy-300">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {actions}
        {walletConnected && (
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-navy-900/70 px-3 py-2">
            <Wallet className="h-4 w-4 text-sky-400" />
            <span className="font-mono text-sm text-navy-200">{walletAddress}</span>
          </div>
        )}
        <RoleBadge role={role} />
      </div>
    </div>
  );
}
