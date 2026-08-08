import type { SimRequest } from "../types/request";
import { StatusBadge } from "./StatusBadge";
import { abbreviateLineId, abbreviateWallet, formatDate } from "../utils/format";

interface RequestCardProps {
  req: SimRequest;
  onClick?: (id: number) => void;
}

export function RequestCard({ req, onClick }: RequestCardProps) {
  return (
    <button
      onClick={() => onClick?.(req.id)}
      className="card group block w-full p-4 text-left transition hover:border-sky-500/40 hover:bg-navy-900/90 animate-fade-in"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-navy-400">#{req.id}</span>
            <span className="truncate text-sm font-semibold text-white">
              {abbreviateLineId(req.lineId)}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-300">
            <span>Titular: {abbreviateWallet(req.holder)}</span>
            <span>{formatDate(req.createdAt)}</span>
          </div>
        </div>
        <StatusBadge status={req.status} />
      </div>
    </button>
  );
}
