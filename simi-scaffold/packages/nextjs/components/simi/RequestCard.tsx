import { ChevronRight } from "lucide-react";

import { StatusBadge } from "./StatusBadge";
import type { SimRequest } from "./types/request";
import {
  abbreviateLineId,
  abbreviateWallet,
  formatDate,
} from "./utils/format";

interface RequestCardProps {
  req: SimRequest;
  onClick?: (requestId: `0x${string}`) => void;
}

const statusAccent: Record<SimRequest["status"], string> = {
  PendingVerification: "before:bg-amber-400",
  PendingHolder: "before:bg-sky-400",
  ReadyToAuthorize: "before:bg-emerald-400",
  ReadyToDispute: "before:bg-rose-400",
  Authorized: "before:bg-emerald-400",
  Disputed: "before:bg-rose-400",
};

export function RequestCard({
  req,
  onClick,
}: RequestCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(req.requestId)}
      className={`relative flex w-full items-center justify-between overflow-hidden rounded-2xl border border-white/10 bg-navy-950/40 p-4 text-left transition hover:border-white/20 hover:bg-navy-900/60 before:absolute before:bottom-0 before:left-0 before:top-0 before:w-1 ${statusAccent[req.status]}`}
    >
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-navy-400">
            {req.requestId.slice(0, 10)}...
          </span>

          <StatusBadge status={req.status} />
        </div>

        <p className="truncate text-sm font-medium text-white">
          Línea: {abbreviateLineId(req.lineId)}
        </p>

        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-400">
          <span>Titular: {abbreviateWallet(req.holder)}</span>
          <span>{formatDate(req.createdAt)}</span>
        </div>
      </div>

      <ChevronRight className="h-5 w-5 shrink-0 text-navy-500" />
    </button>
  );
}