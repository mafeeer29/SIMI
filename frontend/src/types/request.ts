export type RequestStatus =
  | "Created"
  | "IdentityVerified"
  | "Authorized"
  | "Disputed";

export type Role = "Operator" | "Verifier" | "Holder";

export interface SimRequest {
  id: number;
  lineId: string;
  operator: string;
  holder: string;
  createdAt: string;
  identityVerified: boolean;
  holderConfirmed: boolean;
  disputed: boolean;
  status: RequestStatus;
}

export type StepState = "completed" | "current" | "pending";

export interface TimelineStep {
  label: string;
  state: StepState;
}

export interface CreateRequestInput {
  lineId: string;
  holder: string;
}
