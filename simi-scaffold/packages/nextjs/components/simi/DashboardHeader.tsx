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
    <section className="mb-8 overflow-hidden rounded-[32px] border border-white/10 bg-navy-900/80 p-6 shadow-card sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            {role && <RoleBadge role={role} />}
          </div>
          {subtitle && (
            <p className="mt-4 max-w-3xl text-sm leading-7 text-navy-300 sm:text-base">
              {subtitle}
            </p>
          )}
          {walletAddress && (
            <p className="mt-4 break-all font-mono text-xs text-navy-400">
              {walletAddress}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        )}
      </div>
    </section>
  );
}