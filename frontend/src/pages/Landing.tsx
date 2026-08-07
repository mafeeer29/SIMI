import { Link } from "react-router-dom";
import {
  Shield,
  Radio,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Lock,
  FileCheck,
  ShieldAlert,
} from "lucide-react";
import { Button } from "../components/Button";

const flowSteps = [
  { icon: Radio, label: "Operator", desc: "Creates a SIM replacement request", color: "text-sky-400" },
  { icon: FileCheck, label: "Identity Verification", desc: "Verifier validates the holder identity", color: "text-amber-400" },
  { icon: UserCheck, label: "Holder Confirmation", desc: "Holder confirms or disputes the request", color: "text-sky-400" },
  { icon: CheckCircle2, label: "Authorized", desc: "Replacement is authorized on-chain", color: "text-emerald-400" },
];

const securityPoints = [
  {
    icon: Lock,
    title: "On-chain audit trail",
    desc: "Every step is recorded immutably, creating a tamper-proof history of each replacement.",
  },
  {
    icon: ShieldAlert,
    title: "Holder protection",
    desc: "The holder has the final say. Unrecognized requests are blocked instantly.",
  },
  {
    icon: Shield,
    title: "Multi-party authorization",
    desc: "Operator, verifier, and holder must all agree before a SIM is replaced.",
  },
];

export function Landing() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* Hero */}
      <section className="relative overflow-hidden py-12 sm:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="animate-fade-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
              <Shield className="h-3.5 w-3.5" />
              Blockchain-secured telecom
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Secure SIM{" "}
              <span className="bg-gradient-to-r from-sky-400 to-sky-500 bg-clip-text text-transparent">
                replacement
              </span>{" "}
              with on-chain authorization
            </h1>
            <p className="mt-5 max-w-lg text-base text-navy-200 sm:text-lg">
              SIMI adds a blockchain layer of authorization and audit to SIM
              card replacements — protecting holders from fraud through
              multi-party verification.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/dashboard">
                <Button size="lg">
                  Connect Wallet
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/holder">
                <Button size="lg" variant="outline">
                  See how it works
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative animate-scale-in">
            <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-sky-500/20 via-navy-500/10 to-transparent blur-3xl" />
            <img
              src="/assets/simi/hero/simi-hero.png"
              alt="SIMI hero"
              className="mx-auto w-full max-w-md object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="py-12 sm:py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            How SIMI works
          </h2>
          <p className="mt-2 text-navy-300">
            A four-step authorization flow ensures no SIM is replaced without
            every party's consent.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {flowSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="card relative p-5 animate-fade-in">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-800">
                    <Icon className={`h-5 w-5 ${step.color}`} />
                  </div>
                  <span className="text-xs font-mono text-navy-500">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-white">{step.label}</h3>
                <p className="mt-1 text-sm text-navy-300">{step.desc}</p>
                {i < flowSteps.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-navy-600 lg:block" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Security */}
      <section className="py-12 sm:py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Why SIMI matters
          </h2>
          <p className="mt-2 text-navy-300">
            SIM swap fraud is a growing threat. SIMI makes every replacement
            verifiable and revocable.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {securityPoints.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="card p-6 animate-fade-in">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10">
                  <Icon className="h-6 w-6 text-sky-400" />
                </div>
                <h3 className="font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm text-navy-300">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 pb-20">
        <div className="card relative overflow-hidden p-8 text-center sm:p-12">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-navy-800/50 to-sky-500/10" />
          <img
            src="/assets/simi/mascot/simi-welcome.png"
            alt="SIMI mascot"
            className="mx-auto mb-4 h-24 w-24 object-contain drop-shadow-lg"
          />
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to explore SIMI?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-navy-300">
            Navigate the demo dashboards to see the full authorization flow in
            action.
          </p>
          <Link to="/dashboard" className="mt-6 inline-block">
            <Button size="lg">
              Go to Dashboard
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
