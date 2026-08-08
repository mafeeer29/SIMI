import { ChevronRight } from "lucide-react";
import type { SimRequest } from "./types/request";
import { StatusBadge } from "./StatusBadge";
import { abbreviateLineId, abbreviateWallet, formatDate } from "./utils/format";

interface RequestCardProps {
  req: SimRequest;
  onClick?: (id: number) => void;
}

const accentByStatus: Record<SimRequest["status"], string> = {
  Created: "before:bg-sky-400",
  IdentityVerified: "before:bg-amber-400",
  Authorized: "before:bg-emerald-400",
  Disputed: "before:bg-rose-400",
};

export function RequestCard({ req, onClick }: RequestCardProps) {
  const interactive = Boolean(onClick);
  return (
    <button
      onClick={() => onClick?.(req.id)}
      disabled={!interactive}
      className={`group relative flex w-full items-center justify-between gap-4 overflow-hidden rounded-2xl border border-white/10 bg-navy-950/50 px-5 py-4 pl-6 text-left transition duration-200 before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-full ${accentByStatus[req.status]} ${
        interactive
          ? "hover:-translate-y-0.5 hover:border-sky-500/40 hover:bg-navy-900/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
          : "cursor-default"
      }`}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-white/5 px-1.5 py-0.5 font-mono text-[0.7rem] text-navy-300">
            #{req.id}
          </span>
          <span className="truncate font-mono text-sm font-semibold text-white">
            {abbreviateLineId(req.lineId)}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy-400">
          <span>
            Titular <span className="font-mono text-navy-300">{abbreviateWallet(req.holder)}</span>
          </span>
          <span className="hidden h-1 w-1 rounded-full bg-navy-600 sm:inline-block" />
          <span>{formatDate(req.createdAt)}</span>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge status={req.status} />
        {interactive && (
          <ChevronRight className="h-4 w-4 text-navy-500 transition group-hover:translate-x-0.5 group-hover:text-sky-300" />
        )}
      </div>
    </button>
  );
}
