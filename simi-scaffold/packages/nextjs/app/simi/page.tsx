"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { toHex } from "viem";
import {
  useScaffoldReadContract,
  useScaffoldWriteContract,
} from "~~/hooks/scaffold-eth";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { Navbar } from "~~/components/simi/Navbar";
import { GeneralDashboard } from "~~/components/simi/pages/GeneralDashboard";
import { HolderDashboard } from "~~/components/simi/pages/HolderDashboard";
import { Landing } from "~~/components/simi/pages/Landing";
import { OperatorDashboard } from "~~/components/simi/pages/OperatorDashboard";
import { VerifierDashboard } from "~~/components/simi/pages/VerifierDashboard";
import type {
  CreateRequestInput,
  Role,
  SimRequest,
} from "~~/components/simi/types/request";

const SIMI_DEMO_LINE_ID =
  "0x574baa3efb1e924c8243817324eb551669900ee55bd7b69cb1bc52bcd0b77a1e";
const MAX_REQUESTS = 50;
const REQUEST_IDS = Array.from({ length: MAX_REQUESTS }, (_, index) => index + 1);
const REQUEST_STATUS_LABELS = [
  "Created",
  "IdentityVerified",
  "Authorized",
  "Disputed",
] as const;

type RequestStatusLabel = (typeof REQUEST_STATUS_LABELS)[number];

const normalizeRequest = (request: unknown): SimRequest | null => {
  if (!request) return null;
  const req = request as Record<string | number, unknown>;
  const rawId = req.id ?? req[0];
  const id = typeof rawId === "bigint" ? Number(rawId) : Number(rawId);
  if (!id) return null;

  const lineId = String(req.lineId ?? req[1] ?? "");
  const operator = String(req.operatorAddress ?? req[2] ?? "");
  const holder = String(req.holder ?? req[3] ?? "");

  const rawCreatedAt = req.createdAt ?? req[4] ?? 0;
  const createdAtNumber =
    typeof rawCreatedAt === "bigint"
      ? Number(rawCreatedAt)
      : Number(rawCreatedAt);
  const createdAt = new Date(createdAtNumber * 1000).toISOString();

  const identityVerified = Boolean(req.identityVerified ?? req[5] ?? false);
  const holderConfirmed = Boolean(req.holderConfirmed ?? req[6] ?? false);
  const disputed = Boolean(req.disputed ?? req[7] ?? false);

  const rawStatus = req.status ?? req[8];
  const statusIndex =
    typeof rawStatus === "bigint"
      ? Number(rawStatus)
      : typeof rawStatus === "string"
      ? Number(rawStatus)
      : Number(rawStatus);
  const status: RequestStatusLabel =
    Number.isFinite(statusIndex) &&
    statusIndex >= 0 &&
    statusIndex < REQUEST_STATUS_LABELS.length
      ? REQUEST_STATUS_LABELS[statusIndex]
      : "Created";

  return {
    id,
    lineId,
    operator,
    holder,
    createdAt,
    identityVerified,
    holderConfirmed,
    disputed,
    status,
  };
};

const encodeLineId = (lineId: string): `0x${string}` => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(lineId);
  if (bytes.length > 32) {
    throw new Error("Line ID must be 32 bytes or fewer");
  }
  const padded = new Uint8Array(32);
  padded.set(bytes);
  return toHex(padded) as `0x${string}`;
};

const SimiPage = () => {
  const { address, isConnected } = useAccount();

  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDisputing, setIsDisputing] = useState(false);

  /* ============================================================
     ROLES
  ============================================================ */

  const { data: operatorRole } = useScaffoldReadContract({
    contractName: "SIMI",
    functionName: "OPERATOR_ROLE",
  });

  const { data: verifierRole } = useScaffoldReadContract({
    contractName: "SIMI",
    functionName: "VERIFIER_ROLE",
  });

  const { data: isOperator } = useScaffoldReadContract({
    contractName: "SIMI",
    functionName: "hasRole",
    args: [operatorRole, address],
  });

  const { data: isVerifier } = useScaffoldReadContract({
    contractName: "SIMI",
    functionName: "hasRole",
    args: [verifierRole, address],
  });

  /* ============================================================
     TITULAR
  ============================================================ */

  const { data: holderAddress } = useScaffoldReadContract({
    contractName: "SIMI",
    functionName: "lineHolders",
    args: [SIMI_DEMO_LINE_ID],
  });

  const isHolder =
    !!address &&
    !!holderAddress &&
    address.toLowerCase() === String(holderAddress).toLowerCase();

  /* ============================================================
     DATOS GENERALES
  ============================================================ */

  const {
    data: requestCount,
    refetch: refetchRequestCount,
  } = useScaffoldReadContract({
    contractName: "SIMI",
    functionName: "getRequestCount",
  });

  const {
    data: nextRequestId,
    refetch: refetchNextRequestId,
  } = useScaffoldReadContract({
    contractName: "SIMI",
    functionName: "nextRequestId",
  });

  const requestCountNumber = Number(requestCount ?? 0);

  const requestReads = [
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [1n],
      query: { enabled: 1 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [2n],
      query: { enabled: 2 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [3n],
      query: { enabled: 3 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [4n],
      query: { enabled: 4 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [5n],
      query: { enabled: 5 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [6n],
      query: { enabled: 6 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [7n],
      query: { enabled: 7 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [8n],
      query: { enabled: 8 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [9n],
      query: { enabled: 9 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [10n],
      query: { enabled: 10 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [11n],
      query: { enabled: 11 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [12n],
      query: { enabled: 12 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [13n],
      query: { enabled: 13 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [14n],
      query: { enabled: 14 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [15n],
      query: { enabled: 15 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [16n],
      query: { enabled: 16 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [17n],
      query: { enabled: 17 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [18n],
      query: { enabled: 18 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [19n],
      query: { enabled: 19 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [20n],
      query: { enabled: 20 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [21n],
      query: { enabled: 21 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [22n],
      query: { enabled: 22 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [23n],
      query: { enabled: 23 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [24n],
      query: { enabled: 24 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [25n],
      query: { enabled: 25 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [26n],
      query: { enabled: 26 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [27n],
      query: { enabled: 27 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [28n],
      query: { enabled: 28 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [29n],
      query: { enabled: 29 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [30n],
      query: { enabled: 30 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [31n],
      query: { enabled: 31 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [32n],
      query: { enabled: 32 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [33n],
      query: { enabled: 33 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [34n],
      query: { enabled: 34 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [35n],
      query: { enabled: 35 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [36n],
      query: { enabled: 36 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [37n],
      query: { enabled: 37 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [38n],
      query: { enabled: 38 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [39n],
      query: { enabled: 39 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [40n],
      query: { enabled: 40 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [41n],
      query: { enabled: 41 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [42n],
      query: { enabled: 42 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [43n],
      query: { enabled: 43 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [44n],
      query: { enabled: 44 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [45n],
      query: { enabled: 45 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [46n],
      query: { enabled: 46 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [47n],
      query: { enabled: 47 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [48n],
      query: { enabled: 48 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [49n],
      query: { enabled: 49 <= requestCountNumber },
    }),
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "getRequest",
      args: [50n],
      query: { enabled: 50 <= requestCountNumber },
    }),
  ];

  const requests = useMemo(
    () =>
      requestReads
        .map(({ data }) => normalizeRequest(data))
        .filter((request): request is SimRequest => request !== null),
    [requestReads],
  );

  /* ============================================================
     WRITE CONTRACT
  ============================================================ */

  const { writeContractAsync: writeSIMIAsync } =
    useScaffoldWriteContract({
      contractName: "SIMI",
    });

  /* ============================================================
     OPERADOR
  ============================================================ */

  const handleCreateRequest = async (input: CreateRequestInput) => {
    try {
      setIsCreatingRequest(true);

      await writeSIMIAsync({
        functionName: "createRequest",
        args: [encodeLineId(input.lineId)],
      });

      await refetchRequestCount();
      await refetchNextRequestId();
    } catch (error) {
      console.error("Error al crear la solicitud:", error);
    } finally {
      setIsCreatingRequest(false);
    }
  };

  /* ============================================================
     VERIFICADOR
  ============================================================ */

  const handleVerifyIdentity = async (requestId: number) => {
    try {
      setIsVerifying(true);
      await writeSIMIAsync({
        functionName: "verifyIdentity",
        args: [BigInt(requestId)],
      });
    } catch (error) {
      console.error("Error al verificar identidad:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConfirmRequest = async (requestId: number) => {
    try {
      setIsConfirming(true);
      await writeSIMIAsync({
        functionName: "confirmRequest",
        args: [BigInt(requestId)],
      });
    } catch (error) {
      console.error("Error al confirmar la solicitud:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDisputeRequest = async (requestId: number) => {
    try {
      setIsDisputing(true);
      await writeSIMIAsync({
        functionName: "disputeRequest",
        args: [BigInt(requestId)],
      });
    } catch (error) {
      console.error("Error al disputar la solicitud:", error);
    } finally {
      setIsDisputing(false);
    }
  };

  /* ============================================================
     DETECCIÓN DE ROL
  ============================================================ */

  const role: Role = isOperator
    ? "Operator"
    : isVerifier
    ? "Verifier"
    : isHolder
    ? "Holder"
    : null;

  const holderRequests = useMemo(
    () =>
      requests.filter(
        (req) =>
          !!holderAddress &&
          req.holder.toLowerCase() === String(holderAddress).toLowerCase(),
      ),
    [requests, holderAddress],
  );

  /* ============================================================
     INTERFAZ
  ============================================================ */

  return (
    <main className="min-h-screen px-0 py-0">
      <Navbar />

      {!isConnected && <Landing />}

      {isConnected && (
        <div className="space-y-10">
          {role === "Operator" && (
            <OperatorDashboard
              requests={requests}
              role={role}
              isCreatingRequest={isCreatingRequest}
              onCreateRequest={handleCreateRequest}
              onSelectRequest={() => undefined}
            />
          )}

          {role === "Verifier" && (
            <VerifierDashboard
              requests={requests}
              role={role}
              isVerifying={isVerifying}
              onVerifyIdentity={handleVerifyIdentity}
            />
          )}

          {role === "Holder" && (
            <HolderDashboard
              requests={holderRequests}
              isConfirming={isConfirming}
              isDisputing={isDisputing}
              onConfirm={handleConfirmRequest}
              onDispute={handleDisputeRequest}
            />
          )}

          {role === null && <GeneralDashboard requests={requests} role={role} />}
        </div>
      )}
    </main>
  );
};

export default SimiPage;
