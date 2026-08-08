"use client";

import {
  Radio,
  FileCheck,
  UserCheck,
  CheckCircle2,
  Lock,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

const flowSteps = [
  { icon: Radio, label: "Operador", desc: "Registra una solicitud de reposición de SIM.", color: "text-sky-300", ring: "border-sky-500/25 bg-sky-500/10" },
  { icon: FileCheck, label: "Verificación", desc: "El verificador valida la identidad del titular.", color: "text-amber-300", ring: "border-amber-500/25 bg-amber-500/10" },
  { icon: UserCheck, label: "Titular", desc: "El titular reconoce o rechaza la solicitud.", color: "text-sky-300", ring: "border-sky-500/25 bg-sky-500/10" },
  { icon: CheckCircle2, label: "Autorización", desc: "La reposición queda registrada on-chain.", color: "text-emerald-300", ring: "border-emerald-500/25 bg-emerald-500/10" },
];

const securityPoints = [
  {
    icon: Lock,
    title: "Trazabilidad on-chain",
    desc: "Cada paso queda registrado de forma inmutable, con un historial a prueba de manipulaciones.",
  },
  {
    icon: ShieldAlert,
    title: "El titular decide",
    desc: "Las solicitudes no reconocidas por el titular se bloquean al instante.",
  },
  {
    icon: ShieldCheck,
    title: "Autorización multiparte",
    desc: "Operador, verificador y titular deben coincidir antes de reemplazar una SIM.",
  },
];

export function SimiLanding() {
  const { targetNetwork } = useTargetNetwork();
  const networkName = targetNetwork?.name ?? "Arbitrum Sepolia";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      {/* Hero */}
      <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="animate-fade-in">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-500/25 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            Seguridad de telecomunicaciones sobre blockchain
          </div>

          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-white text-balance sm:text-5xl lg:text-6xl">
            Reposiciones de SIM <span className="brand-text">verificables</span> y a prueba de fraude
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-navy-200 sm:text-lg">
            SIMI añade una capa de autorización y auditoría on-chain al proceso de reposición de
            SIM. Cada cambio requiere el consentimiento del operador, el verificador y el titular
            de la línea.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="simi-connect-cta">
              <RainbowKitCustomConnectButton />
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-navy-900/60 px-3.5 py-2 text-sm text-navy-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
              </span>
              Red {networkName}
            </span>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[
              { k: "3", v: "Roles on-chain" },
              { k: "4", v: "Estados verificables" },
              { k: "100%", v: "Trazable" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="text-2xl font-bold text-white sm:text-3xl">{s.k}</dt>
                <dd className="mt-1 text-xs leading-snug text-navy-400">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative animate-scale-in">
          <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-sky-500/25 via-cyan-500/10 to-transparent blur-3xl" />
          <img
            src="/assets/simi/hero/simi-hero.png"
            alt="Ilustración de SIMI protegiendo una tarjeta SIM"
            className="mx-auto w-full max-w-xl animate-float object-contain drop-shadow-2xl"
          />
        </div>
      </section>

      {/* Flow */}
      <section className="mt-16 sm:mt-24">
        <div className="mb-8 max-w-2xl">
          <p className="eyebrow mb-2">El flujo</p>
          <h2 className="text-2xl font-bold text-white text-balance sm:text-3xl">
            Cuatro pasos, una sola verdad on-chain
          </h2>
          <p className="mt-2 text-pretty text-navy-300">
            Ninguna SIM se reemplaza sin que todas las partes coincidan.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {flowSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className={`card animate-fade-in stagger-${i + 1} relative p-5`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${step.ring}`}>
                    <Icon className={`h-5 w-5 ${step.color}`} />
                  </span>
                  <span className="font-mono text-xs text-navy-500">0{i + 1}</span>
                </div>
                <h3 className="font-semibold text-white">{step.label}</h3>
                <p className="mt-1 text-sm leading-relaxed text-navy-300">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why */}
      <section className="mt-16 sm:mt-24">
        <div className="mb-8 max-w-2xl">
          <p className="eyebrow mb-2">Por qué importa</p>
          <h2 className="text-2xl font-bold text-white text-balance sm:text-3xl">
            El SIM swap es una de las mayores puertas al fraude
          </h2>
          <p className="mt-2 text-pretty text-navy-300">
            SIMI convierte cada reposición en un evento verificable y revocable.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {securityPoints.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className={`card animate-fade-in stagger-${i + 1} p-6`}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10">
                  <Icon className="h-6 w-6 text-sky-300" />
                </div>
                <h3 className="font-semibold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-300">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-16 sm:mt-24">
        <div className="card relative overflow-hidden p-8 text-center sm:p-12">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent" />
          <img
            src="/assets/simi/mascot/simi-welcome.png"
            alt="Mascota de bienvenida de SIMI"
            className="mx-auto mb-5 h-24 w-24 object-contain drop-shadow-lg"
          />
          <h2 className="text-2xl font-bold text-white text-balance sm:text-3xl">
            Conecta tu wallet para comenzar
          </h2>
          <p className="mx-auto mt-2 max-w-md text-pretty text-navy-300">
            SIMI detecta tu rol on-chain automáticamente: operador, verificador o titular de línea.
          </p>
          <div className="simi-connect-cta mt-7 flex justify-center">
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      </section>
    </div>
  );
}
