"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { Menu, X, Shield, Wallet } from "lucide-react";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

const links = [{ href: "/simi", label: "Dashboard" }];

const abbreviateAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950/95 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Link href="/simi" className="flex items-center gap-3">
            <img
              src="/assets/simi/logo/simi-isotipo.png"
              alt="SIMI"
              className="h-10 w-10 object-contain"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-semibold text-white">SIMI</span>
              <span className="text-xs uppercase tracking-[0.24em] text-sky-300/70">
                Seguridad de reposición SIM
              </span>
            </div>
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-navy-900/80 px-3 py-1 text-sm text-sky-200 sm:flex">
            <Shield className="h-4 w-4 text-sky-300" />
            {targetNetwork?.name ?? "Arbitrum Sepolia"}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isConnected && address && (
            <span className="hidden rounded-full border border-white/10 bg-navy-900/80 px-3 py-1 text-sm font-mono text-slate-100 sm:inline-flex">
              <Wallet className="mr-2 h-4 w-4 text-sky-300" />
              {abbreviateAddress(address)}
            </span>
          )}
          <div className="hidden sm:block">
            <RainbowKitCustomConnectButton />
          </div>
          <button
            className="rounded-lg p-2 text-navy-200 hover:bg-white/5 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-navy-950/95 px-4 pb-4 pt-3 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  pathname === l.href ? "bg-white/10 text-white" : "text-navy-200 hover:bg-white/5"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="rounded-2xl border border-white/10 bg-navy-900/80 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm text-sky-200">
                <Shield className="h-4 w-4 text-sky-300" />
                {targetNetwork?.name ?? "Arbitrum Sepolia"}
              </div>
              {isConnected && address && (
                <p className="rounded-full border border-white/10 bg-navy-950/90 px-3 py-2 text-sm font-mono text-slate-100">
                  {abbreviateAddress(address)}
                </p>
              )}
              <div className="mt-4">
                <RainbowKitCustomConnectButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
