import { Check, Lock, X } from "lucide-react";

import type { TimelineStep } from "./types/request";

const stateLabels: Record<TimelineStep["state"], string> = {
  completed: "Completado",
  current: "En progreso",
  pending: "En espera",
  disputed: "Bloqueado",
};

export function Timeline({
  steps,
}: {
  steps: TimelineStep[];
}) {
  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;

        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                  step.state === "disputed"
                    ? "border-rose-500 bg-rose-500 text-white"
                    : step.state === "completed"
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : step.state === "current"
                        ? "animate-pulse-soft border-sky-500 bg-sky-500/20 text-sky-300"
                        : "border-navy-600 bg-navy-800 text-navy-400"
                }`}
              >
                {step.state === "disputed" ? (
                  <X className="h-4 w-4" />
                ) : step.state === "completed" ? (
                  <Check className="h-4 w-4" />
                ) : step.state === "current" ? (
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                ) : (
                  <Lock className="h-3.5 w-3.5" />
                )}
              </div>

              {!isLast && (
                <div
                  className={`min-h-[28px] w-0.5 flex-1 ${
                    step.state === "disputed"
                      ? "bg-rose-500/50"
                      : step.state === "completed"
                        ? "bg-emerald-500/50"
                        : "bg-navy-700"
                  }`}
                />
              )}
            </div>

            <div className={`pt-1.5 ${isLast ? "pb-0" : "pb-6"}`}>
              <p
                className={`text-sm font-semibold ${
                  step.state === "disputed"
                    ? "text-rose-300"
                    : step.state === "completed"
                      ? "text-emerald-300"
                      : step.state === "current"
                        ? "text-sky-300"
                        : "text-navy-400"
                }`}
              >
                {step.label}
              </p>

              <p className="text-xs text-navy-400">
                {stateLabels[step.state]}
              </p>

              {step.description && (
                <p className="mt-1 max-w-sm text-xs text-navy-500">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}