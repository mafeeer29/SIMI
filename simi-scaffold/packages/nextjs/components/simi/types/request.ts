export type RequestStatus =
  | "PendingVerification"
  | "PendingHolder"
  | "ReadyToAuthorize"
  | "ReadyToDispute"
  | "Authorized"
  | "Disputed";

export type Role =
  | "Operator"
  | "Verifier"
  | "Holder"
  | null;

export type TimelineStepState =
  | "completed"
  | "current"
  | "pending"
  | "disputed";

export interface TimelineStep {
  label: string;
  description?: string;
  state: TimelineStepState;
}

export interface SimRequest {
  requestId: `0x${string}`;
  lineId: `0x${string}`;
  holder: string;
  createdAt: string;
  deadline: bigint;

  operatorSignature?: `0x${string}`;
  verifierSignature?: `0x${string}`;
  holderSignature?: `0x${string}`;

  status: RequestStatus;
  alertSent?: boolean;
}

export interface CreateRequestInput {
  lineId: string;
  holder: string;
}