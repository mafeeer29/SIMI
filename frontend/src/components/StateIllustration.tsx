type State = "pending" | "authorized" | "blocked";

const stateConfig: Record<
  State,
  { src: string; alt: string; ring: string; bg: string }
> = {
  pending: {
    src: "/assets/simi/states/simi-pending.png",
    alt: "Pending state",
    ring: "ring-amber-400/30",
    bg: "from-amber-500/10",
  },
  authorized: {
    src: "/assets/simi/states/simi-authorized.png",
    alt: "Authorized state",
    ring: "ring-emerald-400/30",
    bg: "from-emerald-500/10",
  },
  blocked: {
    src: "/assets/simi/states/simi-blocked.png",
    alt: "Blocked state",
    ring: "ring-rose-400/30",
    bg: "from-rose-500/10",
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
    <div
      className={`relative flex items-center justify-center ${className}`}
    >
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-b ${cfg.bg} to-transparent blur-2xl`}
      />
      <img
        src={cfg.src}
        alt={cfg.alt}
        className={`relative h-40 w-40 object-contain drop-shadow-lg ring-4 ${cfg.ring} rounded-full bg-navy-900/40 sm:h-48 sm:w-48`}
      />
    </div>
  );
}
