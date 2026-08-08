import { Check, Lock, X } from "lucide-react";
import type { TimelineStep } from "./types/request";

const stateLabels: Record<TimelineStep["state"], string> = {
  completed: "Completado",
  current: "En progreso",
  pending: "En espera",
};

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="flex flex-col gap-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const isDisputed = step.label.includes("Disputada") || step.label.includes("Bloqueada");
        return (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                  step.state === "completed"
                    ? isDisputed
                      ? "border-rose-500 bg-rose-500 text-white"
                      : "border-emerald-500 bg-emerald-500 text-white"
                    : step.state === "current"
                    ? "border-sky-500 bg-sky-500/20 text-sky-300 animate-pulse-soft"
                    : "border-navy-600 bg-navy-800 text-navy-400"
                }`}
              >
                {step.state === "completed" ? (
                  isDisputed ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />
                ) : step.state === "current" ? (
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                ) : (
                  <Lock className="h-3.5 w-3.5" />
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-[28px] ${
                    step.state === "completed"
                      ? isDisputed
                        ? "bg-rose-500/50"
                        : "bg-emerald-500/50"
                      : "bg-navy-700"
                  }`}
                />
              )}
            </div>
            <div className={`pb-6 ${isLast ? "pb-0" : ""} pt-1.5`}>
              <p
                className={`text-sm font-semibold ${
                  step.state === "completed"
                    ? isDisputed
                      ? "text-rose-300"
                      : "text-emerald-300"
                    : step.state === "current"
                    ? "text-sky-300"
                    : "text-navy-400"
                }`}
              >
                {step.label}
              </p>
              <p className="text-xs text-navy-400">{stateLabels[step.state]}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
