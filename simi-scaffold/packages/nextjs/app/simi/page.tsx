"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import {
  useScaffoldReadContract,
  useScaffoldWriteContract,
} from "~~/hooks/scaffold-eth";

const SIMI_DEMO_LINE_ID =
  "0x574baa3efb1e924c8243817324eb551669900ee55bd7b69cb1bc52bcd0b77a1e";

const SimiPage = () => {
  const { address, isConnected } = useAccount();

  const [isCreatingRequest, setIsCreatingRequest] = useState(false);

  const [requestIdToVerify, setRequestIdToVerify] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const [requestIdHolder, setRequestIdHolder] = useState("");
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
    address.toLowerCase() === holderAddress.toLowerCase();

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

  const handleCreateRequest = async () => {
    try {
      setIsCreatingRequest(true);

      await writeSIMIAsync({
        functionName: "createRequest",
        args: [SIMI_DEMO_LINE_ID],
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

  const handleVerifyIdentity = async () => {
    try {
      if (!requestIdToVerify) {
        alert("Ingresa un Request ID.");
        return;
      }

      setIsVerifying(true);

      await writeSIMIAsync({
        functionName: "verifyIdentity",
        args: [BigInt(requestIdToVerify)],
      });

      setRequestIdToVerify("");
    } catch (error) {
      console.error("Error al verificar identidad:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  /* ============================================================
     TITULAR - CONFIRMAR
  ============================================================ */

  const handleConfirmRequest = async () => {
    try {
      if (!requestIdHolder) {
        alert("Ingresa un Request ID.");
        return;
      }

      setIsConfirming(true);

      await writeSIMIAsync({
        functionName: "confirmRequest",
        args: [BigInt(requestIdHolder)],
      });

      setRequestIdHolder("");
    } catch (error) {
      console.error("Error al confirmar la solicitud:", error);
    } finally {
      setIsConfirming(false);
    }
  };

  /* ============================================================
     TITULAR - DISPUTAR
  ============================================================ */

  const handleDisputeRequest = async () => {
    try {
      if (!requestIdHolder) {
        alert("Ingresa un Request ID.");
        return;
      }

      setIsDisputing(true);

      await writeSIMIAsync({
        functionName: "disputeRequest",
        args: [BigInt(requestIdHolder)],
      });

      setRequestIdHolder("");
    } catch (error) {
      console.error("Error al disputar la solicitud:", error);
    } finally {
      setIsDisputing(false);
    }
  };

  /* ============================================================
     DETECCIÓN DE ROL
  ============================================================ */

  let role = "Sin rol";

  if (isOperator) {
    role = "Operador";
  } else if (isVerifier) {
    role = "Verificador";
  } else if (isHolder) {
    role = "Titular";
  }

  /* ============================================================
     INTERFAZ
  ============================================================ */

  return (
    <main className="min-h-screen bg-base-200 px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl bg-base-100 p-8 shadow-xl">
          <h1 className="text-4xl font-bold">SIMI</h1>

          <p className="mt-2 text-base-content/70">
            Autorización y trazabilidad para solicitudes de reemplazo de SIM.
          </p>

          <div className="mt-8 grid gap-4">
            {/* RED */}

            <div className="rounded-2xl border border-base-300 p-5">
              <p className="text-sm text-base-content/60">Red</p>

              <p className="font-semibold">
                Arbitrum Sepolia
              </p>
            </div>

            {/* WALLET */}

            <div className="rounded-2xl border border-base-300 p-5">
              <p className="text-sm text-base-content/60">
                Wallet conectada
              </p>

              <p className="break-all font-mono text-sm">
                {isConnected && address
                  ? address
                  : "Conecta una wallet para comenzar"}
              </p>
            </div>

            {/* ROL */}

            <div className="rounded-2xl border border-base-300 p-5">
              <p className="text-sm text-base-content/60">
                Rol detectado
              </p>

              <p className="mt-1 text-2xl font-bold">
                {isConnected ? role : "Sin wallet"}
              </p>
            </div>

            {/* ESTADÍSTICAS */}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-base-300 p-5">
                <p className="text-sm text-base-content/60">
                  Solicitudes creadas
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {requestCount !== undefined
                    ? requestCount.toString()
                    : "..."}
                </p>
              </div>

              <div className="rounded-2xl border border-base-300 p-5">
                <p className="text-sm text-base-content/60">
                  Próximo Request ID
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {nextRequestId !== undefined
                    ? nextRequestId.toString()
                    : "..."}
                </p>
              </div>
            </div>

            {/* ==================================================
                OPERADOR
            ================================================== */}

            {role === "Operador" && (
              <div className="rounded-2xl border border-base-300 p-6">
                <h2 className="text-2xl font-bold">
                  Panel Operador
                </h2>

                <p className="mt-2 text-base-content/70">
                  Inicia una nueva solicitud de reemplazo de SIM.
                </p>

                <div className="mt-5 rounded-xl bg-base-200 p-4">
                  <p className="text-xs text-base-content/60">
                    Line ID
                  </p>

                  <p className="mt-1 break-all font-mono text-xs">
                    {SIMI_DEMO_LINE_ID}
                  </p>
                </div>

                <button
                  className="btn btn-primary mt-5"
                  onClick={handleCreateRequest}
                  disabled={!isConnected || isCreatingRequest}
                >
                  {isCreatingRequest
                    ? "Creando solicitud..."
                    : "Crear solicitud"}
                </button>
              </div>
            )}

            {/* ==================================================
                VERIFICADOR
            ================================================== */}

            {role === "Verificador" && (
              <div className="rounded-2xl border border-base-300 p-6">
                <h2 className="text-2xl font-bold">
                  Panel Verificador
                </h2>

                <p className="mt-2 text-base-content/70">
                  Registra que la identidad del titular fue validada fuera de
                  la blockchain.
                </p>

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-semibold">
                    Request ID
                  </label>

                  <input
                    type="number"
                    min="1"
                    placeholder="Ej. 3"
                    className="input input-bordered w-full"
                    value={requestIdToVerify}
                    onChange={(event) =>
                      setRequestIdToVerify(event.target.value)
                    }
                  />
                </div>

                <button
                  className="btn btn-primary mt-5"
                  onClick={handleVerifyIdentity}
                  disabled={
                    !isConnected ||
                    isVerifying ||
                    !requestIdToVerify
                  }
                >
                  {isVerifying
                    ? "Verificando..."
                    : "Verificar identidad"}
                </button>
              </div>
            )}

            {/* ==================================================
                TITULAR
            ================================================== */}

            {role === "Titular" && (
              <div className="rounded-2xl border border-base-300 p-6">
                <h2 className="text-2xl font-bold">
                  Panel Titular
                </h2>

                <p className="mt-2 text-base-content/70">
                  Revisa una solicitud de reemplazo y decide si la reconoces.
                </p>

                <div className="mt-5">
                  <label className="mb-2 block text-sm font-semibold">
                    Request ID
                  </label>

                  <input
                    type="number"
                    min="1"
                    placeholder="Ej. 3"
                    className="input input-bordered w-full"
                    value={requestIdHolder}
                    onChange={(event) =>
                      setRequestIdHolder(event.target.value)
                    }
                  />
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    className="btn btn-success"
                    onClick={handleConfirmRequest}
                    disabled={
                      !isConnected ||
                      !requestIdHolder ||
                      isConfirming ||
                      isDisputing
                    }
                  >
                    {isConfirming
                      ? "Confirmando..."
                      : "Confirmar solicitud"}
                  </button>

                  <button
                    className="btn btn-error"
                    onClick={handleDisputeRequest}
                    disabled={
                      !isConnected ||
                      !requestIdHolder ||
                      isConfirming ||
                      isDisputing
                    }
                  >
                    {isDisputing
                      ? "Disputando..."
                      : "Disputar solicitud"}
                  </button>
                </div>

                <div className="mt-5 rounded-xl bg-base-200 p-4">
                  <p className="text-sm text-base-content/70">
                    Confirma únicamente si reconoces la solicitud de reemplazo.
                    Si no la reconoces, puedes disputarla para bloquearla.
                  </p>
                </div>
              </div>
            )}

            {/* SIN ROL */}

            {isConnected && role === "Sin rol" && (
              <div className="rounded-2xl border border-warning p-6">
                <h2 className="text-xl font-bold">
                  Wallet no autorizada
                </h2>

                <p className="mt-2 text-base-content/70">
                  Esta wallet no tiene permisos dentro de SIMI.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default SimiPage;