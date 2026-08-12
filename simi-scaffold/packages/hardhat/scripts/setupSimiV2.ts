import { network } from "hardhat";

const { ethers } = await network.create();

const SIMI_ADDRESS =
  "0xc06c111884603745d33476a671ea88183a939da6";

// ======================================================
// REEMPLAZA SOLO ESTAS 3 DIRECCIONES POR TUS WALLETS
// ======================================================

const OPERATOR_ADDRESS =
  "0xBC84Ba1a7B724557aDbA925EE6CBeC7Fb33A79e9";

const VERIFIER_ADDRESS =
  "0xc8611A041D3B6c1FcD1a0348BE3b27665406B559";

const HOLDER_ADDRESS =
  "0x081ce6C5254662B1EC61AB7fa1fEdE6588624A31";

// Usaremos esta misma línea para el demo.
// Es la que ya venías utilizando anteriormente.
const LINE_ID =
  "0x574baa3efb1e924c8243817324eb551669900ee55bd7b69cb1bc52bcd0b77a1e";

async function main() {
  const signers = await ethers.getSigners();
  const admin = signers[0];

  console.log("Admin:", admin.address);

  const simi: any =
    await ethers.getContractAt(
      "SIMI",
      SIMI_ADDRESS,
      admin,
    );

  const OPERATOR_ROLE =
    await simi.OPERATOR_ROLE();

  const VERIFIER_ROLE =
    await simi.VERIFIER_ROLE();

  console.log("Asignando rol de operadora...");

  let tx =
    await simi.grantRole(
      OPERATOR_ROLE,
      OPERATOR_ADDRESS,
    );

  await tx.wait();

  console.log("✅ Operadora configurada");

  console.log("Asignando rol de verificador...");

  tx =
    await simi.grantRole(
      VERIFIER_ROLE,
      VERIFIER_ADDRESS,
    );

  await tx.wait();

  console.log("✅ Verificador configurado");

  const currentHolder =
    await simi.lineHolders(
      LINE_ID,
    );

  if (
    currentHolder ===
    ethers.ZeroAddress
  ) {
    console.log(
      "Registrando línea del titular...",
    );

    tx =
      await simi.registerLine(
        LINE_ID,
        HOLDER_ADDRESS,
      );

    await tx.wait();

    console.log(
      "✅ Línea registrada",
    );
  } else {
    console.log(
      "ℹ️ La línea ya estaba registrada",
    );
  }

  console.log("");
  console.log("===========================");
  console.log("       SIMI V2 READY");
  console.log("===========================");
  console.log(
    "Operadora:",
    OPERATOR_ADDRESS,
  );
  console.log(
    "Verificador:",
    VERIFIER_ADDRESS,
  );
  console.log(
    "Titular:",
    HOLDER_ADDRESS,
  );
  console.log(
    "Line ID:",
    LINE_ID,
  );
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});