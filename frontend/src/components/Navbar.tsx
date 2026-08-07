import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Shield, Wallet } from "lucide-react";
import { Button } from "./Button";
import { useApp } from "../context/AppContext";

const links = [
  { to: "/", label: "Inicio" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/operator", label: "Operador" },
  { to: "/verifier", label: "Verificador" },
  { to: "/holder", label: "Titular" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { walletConnected, walletAddress, connectWallet, disconnectWallet } = useApp();

  const walletButton = walletConnected ? (
    <button
      onClick={disconnectWallet}
      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-navy-900/70 px-3 py-2 text-sm font-mono text-navy-200 transition hover:bg-navy-800"
    >
      <Wallet className="h-4 w-4 text-sky-400" />
      {walletAddress}
    </button>
  ) : (
    <Button size="sm" onClick={connectWallet}>
      <Shield className="h-4 w-4" />
      Conectar Wallet
    </Button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-navy-950/80 backdrop-blur-lg">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
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
              key={l.to}
              to={l.to}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                location.pathname === l.to
                  ? "bg-white/10 text-white"
                  : "text-navy-200 hover:bg-white/5 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="ml-3">{walletButton}</div>
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
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  location.pathname === l.to
                    ? "bg-white/10 text-white"
                    : "text-navy-200 hover:bg-white/5"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2">{walletButton}</div>
          </div>
        </div>
      )}
    </header>
  );
}
