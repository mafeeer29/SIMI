"use client";

import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { RoleBadge } from "./RoleBadge";
import type { Role } from "./types/request";

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  icon?: LucideIcon;
  role?: Role;
  walletAddress?: string;
  actions?: ReactNode;
}

export function DashboardHeader({
  title,
  subtitle,
  eyebrow,
  icon: Icon,
  role,
  walletAddress,
  actions,
}: DashboardHeaderProps) {
  return (
    <section className="mb-8 overflow-hidden rounded-[28px] border border-white/10 bg-navy-900/70 p-6 shadow-card backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <div className="flex flex-wrap items-center gap-3">
            {Icon && (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10 text-sky-300">
                <Icon className="h-5 w-5" />
              </span>
            )}
            <h1 className="text-2xl font-bold tracking-tight text-white text-balance sm:text-3xl">
              {title}
            </h1>
            {role && <RoleBadge role={role} />}
          </div>
          {subtitle && (
            <p className="mt-3 max-w-3xl text-pretty text-sm leading-7 text-navy-300 sm:text-base">
              {subtitle}
            </p>
          )}
          {walletAddress && (
            <p className="mt-4 break-all font-mono text-xs text-navy-400">{walletAddress}</p>
          )}
        </div>

        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </section>
  );
}
