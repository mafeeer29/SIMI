"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  Radio,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  X,
  XCircle,
} from "lucide-react";
import { useAccount, useSignTypedData } from "wagmi";
import { keccak256, stringToHex, toHex } from "viem";

import {
  useScaffoldReadContract,
  useScaffoldWriteContract,
} from "~~/hooks/scaffold-eth";

import { Navbar } from "~~/components/simi/Navbar";
import { SimiLanding } from "~~/components/simi/pages/SimiLanding";
import { Button } from "~~/components/simi/Button";

import type {
  Role,
  SimRequest,
} from "~~/components/simi/types/request";

import {
  createSimiRequest,
  subscribeToSimiRequests,
  updateSimiRequest,
} from "~~/services/simiRequests";

/* ============================================================
   DEMO CONFIG
============================================================ */

const SIMI_CONTRACT_ADDRESS =
  "0xc06c111884603745d33476a671ea88183a939da6" as const;

const ARBITRUM_SEPOLIA_CHAIN_ID = 421614;

const SIMI_DEMO_LINE_ID =
  "0x574baa3efb1e924c8243817324eb551669900ee55bd7b69cb1bc52bcd0b77a1e" as const;

const DEMO_HOLDER =
  "0x081ce6C5254662B1EC61AB7fa1fEdE6588624A31";

/* ============================================================
   EIP-712
============================================================ */

const approvalTypes = {
  Approval: [
    { name: "requestId", type: "bytes32" },
    { name: "lineId", type: "bytes32" },
    { name: "holder", type: "address" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

const disputeTypes = {
  Dispute: [
    { name: "requestId", type: "bytes32" },
    { name: "lineId", type: "bytes32" },
    { name: "holder", type: "address" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

const domain = {
  name: "SIMI",
  version: "2",
  chainId: ARBITRUM_SEPOLIA_CHAIN_ID,
  verifyingContract: SIMI_CONTRACT_ADDRESS,
} as const;

/* ============================================================
   HELPERS
============================================================ */

function encodeLineId(value: string): `0x${string}` {
  const trimmed = value.trim();

  if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) {
    return trimmed as `0x${string}`;
  }

  const bytes = new TextEncoder().encode(trimmed);

  if (bytes.length > 32) {
    throw new Error(
      "El identificador de línea no puede superar 32 bytes",
    );
  }

  const padded = new Uint8Array(32);
  padded.set(bytes);

  return toHex(padded);
}

function short(value: string) {
  if (value.length < 16) return value;

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function statusText(status: SimRequest["status"]) {
  const labels: Record<SimRequest["status"], string> = {
    PendingVerification: "Pendiente de verificación",
    PendingHolder: "Esperando confirmación",
    ReadyToAuthorize: "Lista para registrar",
    ReadyToDispute: "Alerta lista para bloquear",
    Authorized: "Autorizada",
    Disputed: "Bloqueada",
  };

  return labels[status];
}

/* ============================================================
   PAGE
============================================================ */

export default function SimiPage() {
  const { address, isConnected } = useAccount();

  const {
    signTypedDataAsync,
  } = useSignTypedData();

  const {
    writeContractAsync: writeSIMIAsync,
  } = useScaffoldWriteContract({
    contractName: "SIMI",
  });

  const [requests, setRequests] =
    useState<SimRequest[]>([]);

  const [showCreate, setShowCreate] =
    useState(false);

  const [lineInput, setLineInput] =
    useState(SIMI_DEMO_LINE_ID);

  const [holderInput, setHolderInput] =
    useState(DEMO_HOLDER);

  const [loading, setLoading] =
    useState<string | null>(null);

  /* ============================================================
     FIRESTORE REALTIME
  ============================================================ */

  useEffect(() => {
    const unsubscribe =
      subscribeToSimiRequests(setRequests);

    return unsubscribe;
  }, []);

  /* ============================================================
     ROLES ON-CHAIN
  ============================================================ */

  const { data: operatorRole } =
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "OPERATOR_ROLE",
    });

  const { data: verifierRole } =
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "VERIFIER_ROLE",
    });

  const { data: isOperator } =
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "hasRole",
      args: [
        operatorRole,
        address,
      ],
    });

  const { data: isVerifier } =
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "hasRole",
      args: [
        verifierRole,
        address,
      ],
    });

  const { data: holderAddress } =
    useScaffoldReadContract({
      contractName: "SIMI",
      functionName: "lineHolders",
      args: [
        SIMI_DEMO_LINE_ID,
      ],
    });

  const isHolder =
    !!address &&
    !!holderAddress &&
    address.toLowerCase() ===
      String(holderAddress).toLowerCase();

  const role: Role =
    isOperator
      ? "Operator"
      : isVerifier
        ? "Verifier"
        : isHolder
          ? "Holder"
          : null;

  /* ============================================================
     FILTER REQUESTS BY ROLE
  ============================================================ */

  const holderRequests = useMemo(() => {
    if (!address) return [];

    return requests.filter(
      request =>
        request.holder.toLowerCase() ===
        address.toLowerCase(),
    );
  }, [requests, address]);

  /* ============================================================
     OPERATOR: CREATE + SIGN
  ============================================================ */

  async function createRequest(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!address) return;

    try {
      setLoading("create");

      const lineId =
        encodeLineId(lineInput);

      const holder =
        holderInput.trim() as `0x${string}`;

      const requestId =
        keccak256(
          stringToHex(
            `${lineId}-${holder}-${Date.now()}`,
          ),
        );

      const deadline =
        BigInt(
          Math.floor(Date.now() / 1000) +
            3600,
        );

      const signature =
        await signTypedDataAsync({
          domain,
          types: approvalTypes,
          primaryType: "Approval",
          message: {
            requestId,
            lineId,
            holder,
            deadline,
          },
        });

      const request: SimRequest = {
        requestId,
        lineId,
        holder,
        createdAt:
          new Date().toISOString(),
        deadline,

        operatorSignature:
          signature,

        status:
          "PendingVerification",

        alertSent: false,
      };

      await createSimiRequest(
        request,
      );

      setShowCreate(false);
    } catch (error) {
      console.error(
        "Error creando solicitud:",
        error,
      );

      alert(
        "No se pudo crear la solicitud. Revisa la wallet y la red.",
      );
    } finally {
      setLoading(null);
    }
  }

  /* ============================================================
     VERIFIER: SIGN
  ============================================================ */

  async function verifyRequest(
    request: SimRequest,
  ) {
    try {
      setLoading(
        request.requestId,
      );

      const signature =
        await signTypedDataAsync({
          domain,
          types: approvalTypes,
          primaryType: "Approval",
          message: {
            requestId:
              request.requestId,

            lineId:
              request.lineId,

            holder:
              request.holder as `0x${string}`,

            deadline:
              request.deadline,
          },
        });

      await updateSimiRequest(
        request.requestId,
        {
          verifierSignature:
            signature,

          status:
            "PendingHolder",
        },
      );
    } catch (error) {
      console.error(
        "Error verificando:",
        error,
      );
    } finally {
      setLoading(null);
    }
  }

  /* ============================================================
     HOLDER: APPROVE
  ============================================================ */

  async function confirmRequest(
    request: SimRequest,
  ) {
    try {
      setLoading(
        request.requestId,
      );

      const signature =
        await signTypedDataAsync({
          domain,
          types: approvalTypes,
          primaryType: "Approval",
          message: {
            requestId:
              request.requestId,

            lineId:
              request.lineId,

            holder:
              request.holder as `0x${string}`,

            deadline:
              request.deadline,
          },
        });

      await updateSimiRequest(
        request.requestId,
        {
          holderSignature:
            signature,

          status:
            "ReadyToAuthorize",
        },
      );
    } catch (error) {
      console.error(
        "Error confirmando:",
        error,
      );
    } finally {
      setLoading(null);
    }
  }

  /* ============================================================
     HOLDER: DISPUTE
  ============================================================ */

  async function disputeRequest(
    request: SimRequest,
  ) {
    try {
      setLoading(
        request.requestId,
      );

      const signature =
        await signTypedDataAsync({
          domain,
          types: disputeTypes,
          primaryType: "Dispute",
          message: {
            requestId:
              request.requestId,

            lineId:
              request.lineId,

            holder:
              request.holder as `0x${string}`,

            deadline:
              request.deadline,
          },
        });

      await updateSimiRequest(
        request.requestId,
        {
          holderSignature:
            signature,

          status:
            "ReadyToDispute",
        },
      );
    } catch (error) {
      console.error(
        "Error disputando:",
        error,
      );
    } finally {
      setLoading(null);
    }
  }

  /* ============================================================
     OPERATOR: FINAL AUTHORIZATION → ONLY TX
  ============================================================ */

  async function finalizeAuthorization(
    request: SimRequest,
  ) {
    if (
      !request.operatorSignature ||
      !request.verifierSignature ||
      !request.holderSignature
    ) {
      alert(
        "Faltan firmas para autorizar.",
      );

      return;
    }

    try {
      setLoading(
        request.requestId,
      );

      await writeSIMIAsync({
        functionName:
          "authorizeRequest",

        args: [
          {
            requestId:
              request.requestId,

            lineId:
              request.lineId,

            deadline:
              request.deadline,
          },

          request.operatorSignature,
          request.verifierSignature,
          request.holderSignature,
        ],
      });

      await updateSimiRequest(
        request.requestId,
        {
          status:
            "Authorized",
        },
      );
    } catch (error) {
      console.error(
        "Error registrando autorización:",
        error,
      );

      alert(
        "La transacción no pudo registrarse.",
      );
    } finally {
      setLoading(null);
    }
  }

  /* ============================================================
     OPERATOR: FINAL DISPUTE
  ============================================================ */

  async function finalizeDispute(
    request: SimRequest,
  ) {
    if (!request.holderSignature) {
      return;
    }

    try {
      setLoading(
        request.requestId,
      );

      await writeSIMIAsync({
        functionName:
          "disputeRequest",

        args: [
          {
            requestId:
              request.requestId,

            lineId:
              request.lineId,

            deadline:
              request.deadline,
          },

          request.holderSignature,
        ],
      });

      await updateSimiRequest(
        request.requestId,
        {
          status:
            "Disputed",
        },
      );
    } catch (error) {
      console.error(
        "Error registrando disputa:",
        error,
      );
    } finally {
      setLoading(null);
    }
  }

  /* ============================================================
     DEMO ALERT
  ============================================================ */

  async function sendAlert(
    request: SimRequest,
  ) {
    await updateSimiRequest(
      request.requestId,
      {
        alertSent: true,
      },
    );

    alert(
      "✅ Alerta enviada al titular.\n\nEn la siguiente etapa este evento se conectará con WhatsApp/SMS.",
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <main className="min-h-screen">
      <Navbar />

      {!isConnected && (
        <SimiLanding />
      )}

      {isConnected &&
        role === "Operator" && (
          <OperatorView
            requests={requests}
            loading={loading}
            showCreate={showCreate}
            setShowCreate={
              setShowCreate
            }
            lineInput={lineInput}
            setLineInput={
              setLineInput
            }
            holderInput={
              holderInput
            }
            setHolderInput={
              setHolderInput
            }
            createRequest={
              createRequest
            }
            sendAlert={
              sendAlert
            }
            finalizeAuthorization={
              finalizeAuthorization
            }
            finalizeDispute={
              finalizeDispute
            }
          />
        )}

      {isConnected &&
        role === "Verifier" && (
          <VerifierView
            requests={requests}
            loading={loading}
            onVerify={
              verifyRequest
            }
          />
        )}

      {isConnected &&
        role === "Holder" && (
          <HolderView
            requests={
              holderRequests
            }
            loading={loading}
            onConfirm={
              confirmRequest
            }
            onDispute={
              disputeRequest
            }
          />
        )}

      {isConnected &&
        role === null && (
          <div className="mx-auto max-w-xl px-4 py-20 text-center">
            <ShieldAlert className="mx-auto h-12 w-12 text-amber-300" />

            <h1 className="mt-5 text-2xl font-bold text-white">
              Wallet sin rol asignado
            </h1>

            <p className="mt-3 text-navy-300">
              Esta wallet todavía no
              está autorizada dentro de
              SIMI.
            </p>
          </div>
        )}
    </main>
  );
}

/* ============================================================
   OPERATOR VIEW
============================================================ */

function OperatorView({
  requests,
  loading,
  showCreate,
  setShowCreate,
  lineInput,
  setLineInput,
  holderInput,
  setHolderInput,
  createRequest,
  sendAlert,
  finalizeAuthorization,
  finalizeDispute,
}: any) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-sky-300">
            <Radio className="h-4 w-4" />
            Operadora
          </div>

          <h1 className="text-3xl font-bold text-white">
            Gestión de reposiciones
          </h1>

          <p className="mt-2 text-navy-300">
            Supervisa solicitudes y
            registra en blockchain solo
            el resultado final.
          </p>
        </div>

        <Button
          onClick={() =>
            setShowCreate(true)
          }
        >
          Nueva solicitud
        </Button>
      </div>

      <div className="space-y-4">
        {requests.map(
          (request: SimRequest) => (
            <div
              key={
                request.requestId
              }
              className="card p-5"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="font-mono text-xs text-navy-400">
                    {short(
                      request.requestId,
                    )}
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    {statusText(
                      request.status,
                    )}
                  </p>

                  <p className="mt-1 text-sm text-navy-400">
                    Titular:{" "}
                    {short(
                      request.holder,
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {!request.alertSent &&
                  request.status === "PendingHolder" && (
                    <Button
                      size="sm"
                      onClick={() => sendAlert(request)}
                    >
                      <Bell className="h-4 w-4" />
                      Enviar alerta
                    </Button>
                  )}

                  {request.status ===
                    "ReadyToAuthorize" && (
                    <Button
                      size="sm"
                      variant="success"
                      disabled={
                        loading ===
                        request.requestId
                      }
                      onClick={() =>
                        finalizeAuthorization(
                          request,
                        )
                      }
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Registrar autorización
                    </Button>
                  )}

                  {request.status ===
                    "ReadyToDispute" && (
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={
                        loading ===
                        request.requestId
                      }
                      onClick={() =>
                        finalizeDispute(
                          request,
                        )
                      }
                    >
                      <ShieldAlert className="h-4 w-4" />
                      Bloquear reposición
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ),
        )}

        {requests.length === 0 && (
          <EmptyText text="Todavía no hay solicitudes." />
        )}
      </div>

      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 p-4 backdrop-blur-sm"
          onClick={() =>
            setShowCreate(false)
          }
        >
          <div
            className="modal-panel w-full max-w-md p-6"
            onClick={(
              event: any,
            ) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Nueva solicitud
              </h2>

              <button
                onClick={() =>
                  setShowCreate(false)
                }
              >
                <X className="h-5 w-5 text-navy-300" />
              </button>
            </div>

            <form
              className="mt-6 space-y-4"
              onSubmit={
                createRequest
              }
            >
              <div>
                <label className="mb-2 block text-sm text-white">
                  Identificador de línea
                </label>

                <input
                  className="input-dark font-mono"
                  value={lineInput}
                  onChange={e =>
                    setLineInput(
                      e.target.value,
                    )
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white">
                  Wallet del titular
                </label>

                <input
                  className="input-dark font-mono"
                  value={
                    holderInput
                  }
                  onChange={e =>
                    setHolderInput(
                      e.target.value,
                    )
                  }
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  loading === "create"
                }
              >
                Crear y firmar solicitud
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   VERIFIER VIEW
============================================================ */

function VerifierView({
  requests,
  loading,
  onVerify,
}: any) {
  const pending =
    requests.filter(
      (request: SimRequest) =>
        request.status ===
        "PendingVerification",
    );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Header
        icon={ShieldCheck}
        eyebrow="Verificador"
        title="Validación de identidad"
        description="La identidad se valida fuera de blockchain. Aquí solo se firma la evidencia."
      />

      <div className="space-y-4">
        {pending.map(
          (request: SimRequest) => (
            <div
              key={
                request.requestId
              }
              className="card p-6"
            >
              <p className="font-mono text-xs text-navy-400">
                {short(
                  request.requestId,
                )}
              </p>

              <h2 className="mt-2 font-semibold text-white">
                Solicitud pendiente
              </h2>

              <Button
                className="mt-5"
                disabled={
                  loading ===
                  request.requestId
                }
                onClick={() =>
                  onVerify(request)
                }
              >
                <ShieldCheck className="h-4 w-4" />
                Firmar validación
              </Button>
            </div>
          ),
        )}

        {pending.length === 0 && (
          <EmptyText text="No hay solicitudes pendientes de validación." />
        )}
      </div>
    </div>
  );
}

/* ============================================================
   HOLDER VIEW
============================================================ */

function HolderView({
  requests,
  loading,
  onConfirm,
  onDispute,
}: any) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Header
        icon={UserCheck}
        eyebrow="Seguridad de tu línea"
        title="Tu línea está protegida"
        description="Confirma únicamente operaciones que tú hayas solicitado."
      />

      <div className="space-y-5">
        {requests.map(
          (request: SimRequest) => (
            <div
              key={
                request.requestId
              }
              className="card p-6 sm:p-8"
            >
              <div className="text-center">
                <ShieldAlert className="mx-auto h-12 w-12 text-amber-300" />

                <h2 className="mt-4 text-2xl font-bold text-white">
                  Solicitud de reposición de SIM
                </h2>

                <p className="mt-2 text-navy-300">
                  Se ha solicitado
                  reemplazar tu SIM.
                </p>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-navy-950/50 p-4">
                <p className="text-xs text-navy-500">
                  Fecha
                </p>

                <p className="mt-1 text-white">
                  {new Date(
                    request.createdAt,
                  ).toLocaleString()}
                </p>

                <p className="mt-4 text-xs text-navy-500">
                  Estado
                </p>

                <p className="mt-1 font-semibold text-white">
                  {statusText(
                    request.status,
                  )}
                </p>
              </div>

              {request.status ===
                "PendingHolder" && (
                <>
                  <p className="mt-6 text-center text-lg font-semibold text-white">
                    ¿Reconoces esta solicitud?
                  </p>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Button
                      className="flex-1"
                      variant="success"
                      disabled={
                        loading ===
                        request.requestId
                      }
                      onClick={() =>
                        onConfirm(
                          request,
                        )
                      }
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      Sí, fui yo
                    </Button>

                    <Button
                      className="flex-1"
                      variant="danger"
                      disabled={
                        loading ===
                        request.requestId
                      }
                      onClick={() =>
                        onDispute(
                          request,
                        )
                      }
                    >
                      <XCircle className="h-5 w-5" />
                      No fui yo
                    </Button>
                  </div>
                </>
              )}

              {request.status ===
                "PendingVerification" && (
                <div className="mt-6 flex items-center gap-3 rounded-2xl bg-amber-500/10 p-4 text-amber-200">
                  <Clock className="h-5 w-5" />
                  La operadora está validando la solicitud.
                </div>
              )}

              {request.status ===
                "ReadyToAuthorize" && (
                <SuccessText text="Confirmaste esta solicitud. La operadora registrará la autorización final." />
              )}

              {request.status ===
                "ReadyToDispute" && (
                <SuccessText text="Reportaste esta solicitud. SIMI notificará a la operadora para bloquearla." />
              )}

              {request.status ===
                "Authorized" && (
                <SuccessText text="Reposición autorizada y registrada." />
              )}

              {request.status ===
                "Disputed" && (
                <div className="mt-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-center text-rose-200">
                  Reposición bloqueada.
                </div>
              )}
            </div>
          ),
        )}

        {requests.length === 0 && (
          <EmptyText text="No tienes solicitudes pendientes." />
        )}
      </div>
    </div>
  );
}

/* ============================================================
   SMALL UI HELPERS
============================================================ */

function Header({
  icon: Icon,
  eyebrow,
  title,
  description,
}: any) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-sm text-sky-300">
        <Icon className="h-4 w-4" />
        {eyebrow}
      </div>

      <h1 className="mt-2 text-3xl font-bold text-white">
        {title}
      </h1>

      <p className="mt-2 text-navy-300">
        {description}
      </p>
    </div>
  );
}

function EmptyText({
  text,
}: {
  text: string;
}) {
  return (
    <div className="card py-12 text-center text-navy-300">
      {text}
    </div>
  );
}

function SuccessText({
  text,
}: {
  text: string;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center text-emerald-200">
      <CheckCircle2 className="mx-auto mb-2 h-5 w-5" />
      {text}
    </div>
  );
}