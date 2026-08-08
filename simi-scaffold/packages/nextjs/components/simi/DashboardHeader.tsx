"use client";

import { ReactNode } from "react";
import { RoleBadge } from "./RoleBadge";
import type { Role } from "./types/request";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  role?: Role;
  walletAddress?: string;
  actions?: ReactNode;
}

export function DashboardHeader({
  title,
  subtitle,
  role,
  walletAddress,
  actions,
}: DashboardHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            {title}
          </h1>

          {role && <RoleBadge role={role} />}
        </div>

        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
            {subtitle}
          </p>
        )}

        {walletAddress && (
          <p className="mt-2 break-all font-mono text-xs text-slate-500">
            {walletAddress}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex shrink-0 items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}