import { Shield, Radio, UserCheck, CircleCheck as CheckCircle2, ArrowRight, Lock, FileCheck, ShieldAlert } from "lucide-react";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

const flowSteps = [
  {
    icon: Radio,
    label: "Solicitud del operador",
    desc: "El operador crea una solicitud de reposición de SIM.",
    color: "text-sky-400",
  },
  {
    icon: FileCheck,
    label: "Verificación de identidad",
    desc: "El verificador registra que la identidad fue validada off-chain.",
    color: "text-amber-400",
  },
  {
    icon: UserCheck,
    label: "Confirmación del titular",
    desc: "El titular revisa y reconoce o disputa la solicitud.",
    color: "text-sky-400",
  },
  {
    icon: CheckCircle2,
    label: "Autorización on-chain",
    desc: "La reposición se autoriza y queda registrada on-chain.",
    color: "text-emerald-400",
  },
];

const securityPoints = [
  {
    icon: Lock,
    title: "Trazabilidad on-chain",
    desc: "Cada paso queda registrado de forma inmutable, creando un historial auditable de cada reposición.",
  },
  {
    icon: ShieldAlert,
    title: "Protección del titular",
    desc: "El titular tiene la última palabra. Las solicitudes no reconocidas se bloquean según las reglas del contrato.",
  },
  {
    icon: Shield,
    title: "Autorización multipartita",
    desc: "Operador, verificador y titular deben coincidir antes de autorizar una reposición.",
  },
];

const indicators = [
  { label: "Arbitrum Sepolia", color: "text-sky-300" },
  { label: "Consentimiento verificable", color: "text-cyan-300" },
  { label: "Auditoría on-chain", color: "text-emerald-300" },
];

export function Landing() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* Hero */}
      <section className="relative overflow-hidden py-12 sm:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="animate-fade-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300">
              <Shield className="h-3.5 w-3.5" />
              Seguridad para reposiciones SIM
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Tu SIM.{" "}
              <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">
                Tu autorización.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-navy-200 sm:text-lg">
              SIMI agrega consentimiento verificable y trazabilidad on-chain al
              proceso de reposición de una SIM.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <RainbowKitCustomConnectButton />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {indicators.map((ind) => (
                <span
                  key={ind.label}
                  className={`inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-navy-900/80 px-3 py-1 text-xs font-medium ${ind.color}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {ind.label}
                </span>
              ))}
            </div>
          </div>

          <div className="relative animate-scale-in">
            <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-sky-500/20 via-cyan-500/10 to-transparent blur-3xl" />
            <img
              src="/assets/simi/hero/simi-hero.png"
              alt="SIMI hero"
              className="mx-auto w-full max-w-lg object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="py-12 sm:py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Cómo funciona
          </h2>
          <p className="mt-2 text-navy-300">
            Un flujo de cuatro pasos garantiza que ninguna SIM se reemplace sin
            el consentimiento de todas las partes.
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
            Por qué SIMI importa
          </h2>
          <p className="mt-2 text-navy-300">
            SIMI reduce el riesgo de reposiciones no autorizadas asociadas a
            escenarios como SIM swapping.
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
            Conecta tu wallet para comenzar
          </h2>
          <p className="mx-auto mt-2 max-w-md text-navy-300">
            Explora el flujo completo de autorización y supervisa las
            solicitudes de reposición en Arbitrum Sepolia.
          </p>
          <div className="mt-6 flex justify-center">
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      </section>
    </div>
  );
}
