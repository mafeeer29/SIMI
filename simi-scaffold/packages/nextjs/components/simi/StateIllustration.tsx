type State = "pending" | "authorized" | "blocked";

const stateConfig: Record<
  State,
  { src: string; alt: string; ring: string; glow: string }
> = {
  pending: {
    src: "/assets/simi/states/simi-pending.png",
    alt: "Reposición pendiente de verificación",
    ring: "ring-amber-400/25",
    glow: "bg-amber-500/20",
  },
  authorized: {
    src: "/assets/simi/states/simi-authorized.png",
    alt: "Reposición autorizada",
    ring: "ring-emerald-400/25",
    glow: "bg-emerald-500/20",
  },
  blocked: {
    src: "/assets/simi/states/simi-blocked.png",
    alt: "Reposición bloqueada",
    ring: "ring-rose-400/25",
    glow: "bg-rose-500/20",
  },
};

export function StateIllustration({
  state,
  className = "",
}: {
  state: State;
  className?: string;
}) {
  const cfg = stateConfig[state];
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className={`absolute h-40 w-40 rounded-full ${cfg.glow} blur-3xl sm:h-52 sm:w-52`} />
      <img
        src={cfg.src || "/placeholder.svg"}
        alt={cfg.alt}
        className={`relative h-40 w-40 rounded-full bg-navy-900/50 object-contain p-2 ring-4 drop-shadow-2xl sm:h-48 sm:w-48 ${cfg.ring}`}
      />
    </div>
  );
}
