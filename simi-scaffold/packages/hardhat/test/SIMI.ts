import { expect } from "chai";
import { network } from "hardhat";
import type { Abi_SIMI } from "../generated/abis/SIMI.js";
import { loadAndExecuteDeploymentsFromFiles } from "../rocketh/environment.js";

const { provider, networkHelpers, ethers } = await network.create();

async function deployFixture() {
  const env = await loadAndExecuteDeploymentsFromFiles({ provider });

  const { address, abi } = env.get<Abi_SIMI>("SIMI");

  // Usamos any solo en los tests para evitar que TypeScript
  // trate el contrato como BaseContract genérico.
  const simi: any = await ethers.getContractAt(abi, address);

  const signers = await ethers.getSigners();

  const admin = signers[0];
  const operator = signers[1];
  const verifier = signers[2];
  const holder = signers[3];
  const randomUser = signers[4];

  const OPERATOR_ROLE = await simi.OPERATOR_ROLE();
  const VERIFIER_ROLE = await simi.VERIFIER_ROLE();

  await simi.connect(admin).grantRole(OPERATOR_ROLE, operator.address);
  await simi.connect(admin).grantRole(VERIFIER_ROLE, verifier.address);

  const lineId = ethers.keccak256(
    ethers.toUtf8Bytes("SIMI-DEMO-LINE-001")
  );

  await simi.connect(admin).registerLine(lineId, holder.address);

  return {
    simi,
    admin,
    operator,
    verifier,
    holder,
    randomUser,
    OPERATOR_ROLE,
    VERIFIER_ROLE,
    lineId,
  };
}

describe("SIMI", function () {
  describe("Roles and line registration", function () {
    it("Admin can register a line", async function () {
      const { simi, admin, holder } =
        await networkHelpers.loadFixture(deployFixture);

      const newLineId = ethers.keccak256(
        ethers.toUtf8Bytes("SIMI-DEMO-LINE-002")
      );

      await expect(
        simi.connect(admin).registerLine(newLineId, holder.address)
      ).to.emit(simi, "LineRegistered");

      expect(await simi.lineHolders(newLineId)).to.equal(holder.address);
    });

    it("Random user cannot register a line", async function () {
      const { simi, randomUser, holder } =
        await networkHelpers.loadFixture(deployFixture);

      const newLineId = ethers.keccak256(
        ethers.toUtf8Bytes("SIMI-DEMO-LINE-003")
      );

      await expect(
        simi.connect(randomUser).registerLine(newLineId, holder.address)
      ).to.revert(ethers);
    });
  });

  describe("Request creation", function () {
    it("Operator can create a request", async function () {
      const { simi, operator, lineId } =
        await networkHelpers.loadFixture(deployFixture);

      await expect(
        simi.connect(operator).createRequest(lineId)
      ).to.emit(simi, "RequestCreated");

      const request = await simi.getRequest(1);

      expect(request.id).to.equal(1);
      expect(request.lineId).to.equal(lineId);
      expect(request.operatorAddress).to.equal(operator.address);
      expect(request.identityVerified).to.equal(false);
      expect(request.holderConfirmed).to.equal(false);
      expect(request.disputed).to.equal(false);
      expect(request.status).to.equal(0);
    });

    it("Random user cannot create a request", async function () {
      const { simi, randomUser, lineId } =
        await networkHelpers.loadFixture(deployFixture);

      await expect(
        simi.connect(randomUser).createRequest(lineId)
      ).to.revert(ethers);
    });

    it("Does not allow two active requests for the same line", async function () {
      const { simi, operator, lineId } =
        await networkHelpers.loadFixture(deployFixture);

      await simi.connect(operator).createRequest(lineId);

      await expect(
        simi.connect(operator).createRequest(lineId)
      ).to.be.revertedWith("Line already has active request");
    });

    it("Request count increases after creating a request", async function () {
      const { simi, operator, lineId } =
        await networkHelpers.loadFixture(deployFixture);

      expect(await simi.getRequestCount()).to.equal(0);

      await simi.connect(operator).createRequest(lineId);

      expect(await simi.getRequestCount()).to.equal(1);
      expect(await simi.nextRequestId()).to.equal(2);
    });
  });

  describe("Identity verification", function () {
    it("Verifier can verify identity", async function () {
      const { simi, operator, verifier, lineId } =
        await networkHelpers.loadFixture(deployFixture);

      await simi.connect(operator).createRequest(lineId);

      await expect(
        simi.connect(verifier).verifyIdentity(1)
      ).to.emit(simi, "IdentityVerified");

      const request = await simi.getRequest(1);

      expect(request.identityVerified).to.equal(true);
      expect(request.status).to.equal(1);
    });

    it("Operator cannot verify identity", async function () {
      const { simi, operator, lineId } =
        await networkHelpers.loadFixture(deployFixture);

      await simi.connect(operator).createRequest(lineId);

      await expect(
        simi.connect(operator).verifyIdentity(1)
      ).to.revert(ethers);
    });
  });

  describe("Holder confirmation", function () {
    it("Holder can confirm a verified request", async function () {
      const { simi, operator, verifier, holder, lineId } =
        await networkHelpers.loadFixture(deployFixture);

      await simi.connect(operator).createRequest(lineId);
      await simi.connect(verifier).verifyIdentity(1);

      await expect(
        simi.connect(holder).confirmRequest(1)
      ).to.emit(simi, "RequestAuthorized");

      const request = await simi.getRequest(1);

      expect(request.holderConfirmed).to.equal(true);
      expect(request.status).to.equal(2);
    });

    it("Another wallet cannot confirm the request", async function () {
      const {
        simi,
        operator,
        verifier,
        randomUser,
        lineId,
      } = await networkHelpers.loadFixture(deployFixture);

      await simi.connect(operator).createRequest(lineId);
      await simi.connect(verifier).verifyIdentity(1);

      await expect(
        simi.connect(randomUser).confirmRequest(1)
      ).to.be.revertedWith("Only holder can confirm");
    });

    it("Holder cannot confirm before identity verification", async function () {
      const { simi, operator, holder, lineId } =
        await networkHelpers.loadFixture(deployFixture);

      await simi.connect(operator).createRequest(lineId);

      await expect(
        simi.connect(holder).confirmRequest(1)
      ).to.be.revertedWith("Identity not verified");
    });

    it("Authorized request releases the line for a future request", async function () {
      const {
        simi,
        operator,
        verifier,
        holder,
        lineId,
      } = await networkHelpers.loadFixture(deployFixture);

      await simi.connect(operator).createRequest(lineId);

      expect(
        await simi.activeRequestByLine(lineId)
      ).to.equal(1);

      await simi.connect(verifier).verifyIdentity(1);
      await simi.connect(holder).confirmRequest(1);

      expect(
        await simi.activeRequestByLine(lineId)
      ).to.equal(0);

      await expect(
        simi.connect(operator).createRequest(lineId)
      ).to.emit(simi, "RequestCreated");

      const secondRequest = await simi.getRequest(2);

      expect(secondRequest.id).to.equal(2);
    });
  });

  describe("Dispute flow", function () {
    it("Holder can dispute a request", async function () {
      const { simi, operator, holder, lineId } =
        await networkHelpers.loadFixture(deployFixture);

      await simi.connect(operator).createRequest(lineId);

      await expect(
        simi.connect(holder).disputeRequest(1)
      ).to.emit(simi, "RequestDisputed");

      const request = await simi.getRequest(1);

      expect(request.disputed).to.equal(true);
      expect(request.status).to.equal(3);
    });

    it("Another wallet cannot dispute the request", async function () {
      const { simi, operator, randomUser, lineId } =
        await networkHelpers.loadFixture(deployFixture);

      await simi.connect(operator).createRequest(lineId);

      await expect(
        simi.connect(randomUser).disputeRequest(1)
      ).to.be.revertedWith("Only holder can dispute");
    });

    it("A disputed request cannot be verified or authorized", async function () {
      const {
        simi,
        operator,
        verifier,
        holder,
        lineId,
      } = await networkHelpers.loadFixture(deployFixture);

      await simi.connect(operator).createRequest(lineId);
      await simi.connect(holder).disputeRequest(1);

      await expect(
        simi.connect(verifier).verifyIdentity(1)
      ).to.be.revertedWith("Request disputed");

      await expect(
        simi.connect(holder).confirmRequest(1)
      ).to.be.revertedWith("Request disputed");
    });

    it("Disputed request releases the line for a future request", async function () {
      const { simi, operator, holder, lineId } =
        await networkHelpers.loadFixture(deployFixture);

      await simi.connect(operator).createRequest(lineId);

      expect(
        await simi.activeRequestByLine(lineId)
      ).to.equal(1);

      await simi.connect(holder).disputeRequest(1);

      expect(
        await simi.activeRequestByLine(lineId)
      ).to.equal(0);

      await expect(
        simi.connect(operator).createRequest(lineId)
      ).to.emit(simi, "RequestCreated");

      const secondRequest = await simi.getRequest(2);

      expect(secondRequest.id).to.equal(2);
    });
  });

  describe("Complete legitimate flow", function () {
    it("Created -> IdentityVerified -> Authorized", async function () {
      const {
        simi,
        operator,
        verifier,
        holder,
        lineId,
      } = await networkHelpers.loadFixture(deployFixture);

      await simi.connect(operator).createRequest(lineId);

      let request = await simi.getRequest(1);

      expect(request.status).to.equal(0);
      expect(request.identityVerified).to.equal(false);
      expect(request.holderConfirmed).to.equal(false);
      expect(request.disputed).to.equal(false);

      await simi.connect(verifier).verifyIdentity(1);

      request = await simi.getRequest(1);

      expect(request.status).to.equal(1);
      expect(request.identityVerified).to.equal(true);

      await simi.connect(holder).confirmRequest(1);

      request = await simi.getRequest(1);

      expect(request.status).to.equal(2);
      expect(request.identityVerified).to.equal(true);
      expect(request.holderConfirmed).to.equal(true);
      expect(request.disputed).to.equal(false);
    });
  });
});