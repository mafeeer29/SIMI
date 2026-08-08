import type { SimRequest } from "./types/request";
import { StatusBadge } from "./StatusBadge";
import { abbreviateLineId, abbreviateWallet, formatDate } from "./utils/format";

interface RequestCardProps {
  req: SimRequest;
  onClick?: (id: number) => void;
}

export function RequestCard({ req, onClick }: RequestCardProps) {
  return (
    <button
      onClick={() => onClick?.(req.id)}
      className="group flex w-full items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-navy-900/75 px-5 py-4 text-left shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-sky-500/40 hover:bg-navy-900/95 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-navy-400">#{req.id}</span>
          <span className="truncate text-sm font-semibold text-white">
            {abbreviateLineId(req.lineId)}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-sm text-navy-300">
          <span>Titular: {abbreviateWallet(req.holder)}</span>
          <span>{formatDate(req.createdAt)}</span>
        </div>
      </div>
      <div className="shrink-0"> 
        <StatusBadge status={req.status} />
      </div>
    </button>
  );
}
