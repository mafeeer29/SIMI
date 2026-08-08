"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { Wallet } from "lucide-react";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

const abbreviateAddress = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

export function Navbar() {
  const { address, isConnected } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950/80 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        {/* Brand */}
        <Link href="/simi" className="flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center">
            <span className="absolute inset-0 rounded-2xl bg-sky-500/15 blur-md" aria-hidden />
            <img
              src="/assets/simi/logo/simi-isotipo.png"
              alt="SIMI"
              className="relative h-10 w-10 object-contain"
            />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-white">SIMI</span>
            <span className="mt-1 hidden text-[0.65rem] font-medium uppercase tracking-[0.2em] text-sky-300/70 sm:block">
              SIM Integrity Layer
            </span>
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Network badge */}
          <span className="hidden items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-200 sm:inline-flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400/70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sky-400" />
            </span>
            {targetNetwork?.name ?? "Arbitrum Sepolia"}
          </span>

          {/* Abbreviated wallet */}
          {isConnected && address && (
            <span className="hidden items-center gap-2 rounded-full border border-white/10 bg-navy-900/70 px-3 py-1.5 font-mono text-xs text-slate-100 md:inline-flex">
              <Wallet className="h-3.5 w-3.5 text-sky-300" />
              {abbreviateAddress(address)}
            </span>
          )}

          <RainbowKitCustomConnectButton />
        </div>
      </div>
    </header>
  );
}
