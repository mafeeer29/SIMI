import { network } from "hardhat";
import type { Abi_SIMI } from "../generated/abis/SIMI.js";
import { loadAndExecuteDeploymentsFromFiles } from "../rocketh/environment.js";

const { provider, ethers } = await network.connect();

const OPERATOR_ADDRESS =
  "0xBC84Ba1a7B724557aDbA925EE6CBeC7Fb33A79e9";

const VERIFIER_ADDRESS =
  "0xc8611A041D3B6c1FcD1a0348BE3b27665406B559";

const HOLDER_ADDRESS =
  "0x081ce6C5254662B1EC61AB7fa1fEdE6588624A31";

async function main() {
  const env = await loadAndExecuteDeploymentsFromFiles({ provider });

  const { address, abi } = env.get<Abi_SIMI>("SIMI");

  const simi: any = await ethers.getContractAt(abi, address);

  const [admin] = await ethers.getSigners();

  console.log("Contrato SIMI:", address);
  console.log("Admin:", admin.address);

  const OPERATOR_ROLE = await simi.OPERATOR_ROLE();
  const VERIFIER_ROLE = await simi.VERIFIER_ROLE();

  console.log("\nAsignando OPERATOR_ROLE...");

  const txOperator = await simi
    .connect(admin)
    .grantRole(OPERATOR_ROLE, OPERATOR_ADDRESS);

  await txOperator.wait();

  console.log("Operador autorizado:", OPERATOR_ADDRESS);

  console.log("\nAsignando VERIFIER_ROLE...");

  const txVerifier = await simi
    .connect(admin)
    .grantRole(VERIFIER_ROLE, VERIFIER_ADDRESS);

  await txVerifier.wait();

  console.log("Verificador autorizado:", VERIFIER_ADDRESS);

  const lineId = ethers.keccak256(
    ethers.toUtf8Bytes("SIMI-DEMO-LINE-001")
  );

  console.log("\nRegistrando linea demo...");

  const txLine = await simi
    .connect(admin)
    .registerLine(lineId, HOLDER_ADDRESS);

  await txLine.wait();

  console.log("Titular:", HOLDER_ADDRESS);
  console.log("lineId:", lineId);

  console.log("\nConfiguracion demo completada.");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});