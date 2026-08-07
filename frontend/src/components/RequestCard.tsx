import { Link } from "react-router-dom";
import type { SimRequest } from "../types/request";
import { StatusBadge } from "./StatusBadge";
import { abbreviateLineId, abbreviateWallet, formatDate } from "../utils/format";

export function RequestCard({ req }: { req: SimRequest }) {
  return (
    <Link
      to="/holder"
      className="card group block p-4 transition hover:border-sky-500/40 hover:bg-navy-900/90 animate-fade-in"
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
            <span>Holder: {abbreviateWallet(req.holder)}</span>
            <span>{formatDate(req.createdAt)}</span>
          </div>
        </div>
        <StatusBadge status={req.status} />
      </div>
    </Link>
  );
}
