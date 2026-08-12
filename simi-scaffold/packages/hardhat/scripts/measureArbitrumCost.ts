import { network } from "hardhat";
import type { Abi_SIMI } from "../generated/abis/SIMI.js";

const { ethers, networkName } = await network.create();

const SIMI_ADDRESS =
  "0xc06c111884603745d33476a671ea88183a939da6";

async function main() {
  console.log("Network:", networkName);

  const networkInfo =
    await ethers.provider.getNetwork();

  console.log(
    "Chain ID:",
    networkInfo.chainId.toString()
  );

  if (networkInfo.chainId !== 421614n) {
    throw new Error(
      `Wrong network. Expected Arbitrum Sepolia 421614, got ${networkInfo.chainId}`
    );
  }

  /*
   * Solo la cuenta deployer necesita estar financiada.
   *
   * Operator, verifier y holder serán wallets temporales:
   * solo firman off-chain, así que NO necesitan ETH.
   */
  const signers =
    await ethers.getSigners();

  const admin = signers[0];

  if (!admin) {
    throw new Error(
      "No deployer signer available"
    );
  }

  console.log(
    "Admin / relayer:",
    admin.address
  );

  /*
   * ABI actual del contrato V2.
   */
  const artifact =
    await import(
      "../generated/abis/SIMI.js"
    );

  /*
   * Dependiendo de cómo generateTypedArtifacts exporte
   * el archivo, tomamos el ABI generado.
   */
  const abi =
    (artifact as any).abi ??
    (artifact as any).SIMI ??
    (artifact as any).default;

  if (!abi) {
    throw new Error(
      "Could not load SIMI ABI"
    );
  }

  const simi: any =
    await ethers.getContractAt(
      abi,
      SIMI_ADDRESS,
      admin
    );

  /*
   * Wallets temporales.
   * No tienen fondos y no los necesitan.
   */
  const operator =
    ethers.Wallet.createRandom();

  const verifier =
    ethers.Wallet.createRandom();

  const holder =
    ethers.Wallet.createRandom();

  console.log(
    "Temporary operator:",
    operator.address
  );

  console.log(
    "Temporary verifier:",
    verifier.address
  );

  console.log(
    "Temporary holder:",
    holder.address
  );

  const OPERATOR_ROLE =
    await simi.OPERATOR_ROLE();

  const VERIFIER_ROLE =
    await simi.VERIFIER_ROLE();

  /*
   * Configuración previa.
   * Estas TX NO se cuentan como costo por reposición:
   * son enrolamiento/configuración.
   */
  console.log(
    "\nAssigning operator role..."
  );

  let tx =
    await simi.grantRole(
      OPERATOR_ROLE,
      operator.address
    );

  await tx.wait();

  console.log(
    "Assigning verifier role..."
  );

  tx =
    await simi.grantRole(
      VERIFIER_ROLE,
      verifier.address
    );

  await tx.wait();

  const uniqueSuffix =
    Date.now().toString();

  const lineId =
    ethers.keccak256(
      ethers.toUtf8Bytes(
        `SIMI-COST-LINE-${uniqueSuffix}`
      )
    );

  console.log(
    "Registering pseudonymous line..."
  );

  tx =
    await simi.registerLine(
      lineId,
      holder.address
    );

  await tx.wait();

  /*
   * Nueva solicitud.
   */
  const requestId =
    ethers.keccak256(
      ethers.toUtf8Bytes(
        `SIMI-COST-REQUEST-${uniqueSuffix}`
      )
    );

  const block =
    await ethers.provider.getBlock(
      "latest"
    );

  if (!block) {
    throw new Error(
      "Could not read latest block"
    );
  }

  const deadline =
    BigInt(
      block.timestamp + 3600
    );

  /*
   * EIP-712 domain.
   */
  const domain = {
    name: "SIMI",
    version: "2",
    chainId: networkInfo.chainId,
    verifyingContract: SIMI_ADDRESS,
  };

  const types = {
    Approval: [
      {
        name: "requestId",
        type: "bytes32",
      },
      {
        name: "lineId",
        type: "bytes32",
      },
      {
        name: "holder",
        type: "address",
      },
      {
        name: "deadline",
        type: "uint256",
      },
    ],
  };

  const value = {
    requestId,
    lineId,
    holder: holder.address,
    deadline,
  };

  /*
   * Estas tres operaciones son firmas OFF-CHAIN.
   * No consumen gas.
   */
  const operatorSignature =
    await operator.signTypedData(
      domain,
      types,
      value
    );

  const verifierSignature =
    await verifier.signTypedData(
      domain,
      types,
      value
    );

  const holderSignature =
    await holder.signTypedData(
      domain,
      types,
      value
    );

  console.log(
    "\nSending authorizeRequest..."
  );

  /*
   * Única TX del flujo normal.
   * La manda el deployer simulando el relayer
   * de la operadora.
   */
  const authorizeTx =
    await simi.authorizeRequest(
      {
        requestId,
        lineId,
        deadline,
      },
      operatorSignature,
      verifierSignature,
      holderSignature
    );

  const receipt =
    await authorizeTx.wait();

  if (!receipt) {
    throw new Error(
      "No authorizeRequest receipt"
    );
  }

  const gasUsed =
    receipt.gasUsed;

  const gasPrice =
    receipt.gasPrice ??
    authorizeTx.gasPrice ??
    0n;

  const totalCostWei =
    gasUsed * gasPrice;

  const totalCostEth =
    ethers.formatEther(
      totalCostWei
    );

  console.log("");
  console.log(
    "======================================"
  );
  console.log(
    " SIMI V2 - ARBITRUM SEPOLIA COST"
  );
  console.log(
    "======================================"
  );
  console.log(
    "TX:",
    receipt.hash
  );
  console.log(
    "Gas used:",
    gasUsed.toString()
  );
  console.log(
    "Gas price (wei):",
    gasPrice.toString()
  );
  console.log(
    "Total cost (wei):",
    totalCostWei.toString()
  );
  console.log(
    "Total cost (ETH):",
    totalCostEth
  );
  console.log(
    "Normal-flow transactions: 1"
  );
  console.log(
    "======================================"
  );
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});