"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

const links = [{ href: "/simi", label: "Dashboard" }];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const walletButton = (
    <div className="ml-3">
      <RainbowKitCustomConnectButton />
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/simi" className="flex items-center gap-2.5">
          <img
            src="/assets/simi/logo/simi-isotipo.png"
            alt="SIMI"
            className="h-8 w-8 object-contain"
          />
          <span className="text-lg font-bold tracking-tight text-white">
            SIMI
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname === l.href
                  ? "bg-white/10 text-white"
                  : "text-navy-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {walletButton}
        </div>

        <button
          className="rounded-lg p-2 text-navy-200 hover:bg-white/5 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-navy-950 px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  pathname === l.href ? "bg-white/10 text-white" : "text-navy-200 hover:bg-white/5"
                }`}
              >
                {l.label}
              </Link>
            ))}
            {walletButton}
          </div>
        </div>
      )}
    </header>
  );
}
