import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.create();

describe("SIMI V1 gas measurement", function () {
  it("Measures gas used by V1 flow", async function () {
    const signers = await ethers.getSigners();

    const admin = signers[0];
    const operator = signers[1];
    const verifier = signers[2];
    const holder = signers[3];

    const factory = await ethers.getContractFactory("SIMIV1");

    const simi: any = await factory.connect(admin).deploy();

    await simi.waitForDeployment();

    const OPERATOR_ROLE = await simi.OPERATOR_ROLE();
    const VERIFIER_ROLE = await simi.VERIFIER_ROLE();

    await simi
      .connect(admin)
      .grantRole(OPERATOR_ROLE, operator.address);

    await simi
      .connect(admin)
      .grantRole(VERIFIER_ROLE, verifier.address);

    const lineId = ethers.keccak256(
      ethers.toUtf8Bytes("SIMI-GAS-V1-LINE")
    );

    await simi
      .connect(admin)
      .registerLine(
        lineId,
        holder.address
      );

    /* CREATE REQUEST */

    const createTx =
      await simi
        .connect(operator)
        .createRequest(lineId);

    const createReceipt =
      await createTx.wait();

    if (!createReceipt) {
      throw new Error(
        "No receipt for createRequest"
      );
    }

    /* VERIFY IDENTITY */

    const verifyTx =
      await simi
        .connect(verifier)
        .verifyIdentity(1);

    const verifyReceipt =
      await verifyTx.wait();

    if (!verifyReceipt) {
      throw new Error(
        "No receipt for verifyIdentity"
      );
    }

    /* HOLDER CONFIRMATION */

    const confirmTx =
      await simi
        .connect(holder)
        .confirmRequest(1);

    const confirmReceipt =
      await confirmTx.wait();

    if (!confirmReceipt) {
      throw new Error(
        "No receipt for confirmRequest"
      );
    }

    const createGas =
      createReceipt.gasUsed;

    const verifyGas =
      verifyReceipt.gasUsed;

    const confirmGas =
      confirmReceipt.gasUsed;

    const totalGas =
      createGas +
      verifyGas +
      confirmGas;

    const fs =
      await import("node:fs");

    const report = `
SIMI V1 - GAS REPORT
====================
createRequest gas used: ${createGas.toString()}
verifyIdentity gas used: ${verifyGas.toString()}
confirmRequest gas used: ${confirmGas.toString()}

TOTAL V1 gas used: ${totalGas.toString()}
Transactions in normal V1 flow: 3
`;

    fs.writeFileSync(
      "simi-v1-gas-report.txt",
      report
    );

    process.stdout.write(report);

    expect(
      createGas
    ).to.be.greaterThan(0n);

    expect(
      verifyGas
    ).to.be.greaterThan(0n);

    expect(
      confirmGas
    ).to.be.greaterThan(0n);
  });
});