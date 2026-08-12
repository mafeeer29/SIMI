import { expect } from "chai";
import { network } from "hardhat";
import type { Abi_SIMI } from "../generated/abis/SIMI.js";
import { loadAndExecuteDeploymentsFromFiles } from "../rocketh/environment.js";

const { provider, networkHelpers, ethers } = await network.create();

/*//////////////////////////////////////////////////////////////
                         FIXTURE
//////////////////////////////////////////////////////////////*/

async function deployFixture() {
  const env = await loadAndExecuteDeploymentsFromFiles({ provider });

  const { address, abi } = env.get<Abi_SIMI>("SIMI");

  const simi: any = await ethers.getContractAt(abi, address);

  const signers = await ethers.getSigners();

  const admin = signers[0];
  const operator = signers[1];
  const verifier = signers[2];
  const holder = signers[3];
  const randomUser = signers[4];

  const OPERATOR_ROLE = await simi.OPERATOR_ROLE();
  const VERIFIER_ROLE = await simi.VERIFIER_ROLE();

  await simi
    .connect(admin)
    .grantRole(OPERATOR_ROLE, operator.address);

  await simi
    .connect(admin)
    .grantRole(VERIFIER_ROLE, verifier.address);

  const lineId = ethers.keccak256(
    ethers.toUtf8Bytes("SIMI-DEMO-LINE-001")
  );

  await simi
    .connect(admin)
    .registerLine(lineId, holder.address);

  return {
    simi,
    address,
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

/*//////////////////////////////////////////////////////////////
                       EIP-712 HELPERS
//////////////////////////////////////////////////////////////*/

async function getDomain(contractAddress: string) {
  const networkInfo = await ethers.provider.getNetwork();

  return {
    name: "SIMI",
    version: "2",
    chainId: networkInfo.chainId,
    verifyingContract: contractAddress,
  };
}

const approvalTypes = {
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

const disputeTypes = {
  Dispute: [
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

async function createApprovalSignatures(
  address: string,
  requestId: string,
  lineId: string,
  holder: any,
  operator: any,
  verifier: any,
  deadline: bigint
) {
  const domain = await getDomain(address);

  const value = {
    requestId,
    lineId,
    holder: holder.address,
    deadline,
  };

  const operatorSignature = await operator.signTypedData(
    domain,
    approvalTypes,
    value
  );

  const verifierSignature = await verifier.signTypedData(
    domain,
    approvalTypes,
    value
  );

  const holderSignature = await holder.signTypedData(
    domain,
    approvalTypes,
    value
  );

  return {
    operatorSignature,
    verifierSignature,
    holderSignature,
  };
}

async function createDisputeSignature(
  address: string,
  requestId: string,
  lineId: string,
  holder: any,
  deadline: bigint
) {
  const domain = await getDomain(address);

  const value = {
    requestId,
    lineId,
    holder: holder.address,
    deadline,
  };

  return holder.signTypedData(
    domain,
    disputeTypes,
    value
  );
}

/*//////////////////////////////////////////////////////////////
                             TESTS
//////////////////////////////////////////////////////////////*/

describe("SIMI V2", function () {
  /*//////////////////////////////////////////////////////////////
                      ROLES AND REGISTRATION
  //////////////////////////////////////////////////////////////*/

  describe("Roles and line registration", function () {
    it("Admin can register a line", async function () {
      const {
        simi,
        admin,
        holder,
      } = await networkHelpers.loadFixture(deployFixture);

      const newLineId = ethers.keccak256(
        ethers.toUtf8Bytes("SIMI-DEMO-LINE-002")
      );

      await expect(
        simi
          .connect(admin)
          .registerLine(
            newLineId,
            holder.address
          )
      ).to.emit(
        simi,
        "LineRegistered"
      );

      expect(
        await simi.lineHolders(newLineId)
      ).to.equal(holder.address);
    });

    it("Random user cannot register a line", async function () {
      const {
        simi,
        randomUser,
        holder,
      } = await networkHelpers.loadFixture(deployFixture);

      const newLineId = ethers.keccak256(
        ethers.toUtf8Bytes("SIMI-DEMO-LINE-003")
      );

      await expect(
        simi
          .connect(randomUser)
          .registerLine(
            newLineId,
            holder.address
          )
      ).to.revert(ethers);
    });
  });

  /*//////////////////////////////////////////////////////////////
                       LEGITIMATE FLOW
  //////////////////////////////////////////////////////////////*/

  describe("Authorization flow", function () {
    it("Authorizes with valid operator, verifier and holder signatures", async function () {
      const {
        simi,
        address,
        operator,
        verifier,
        holder,
        randomUser,
        lineId,
      } = await networkHelpers.loadFixture(deployFixture);

      const requestId = ethers.keccak256(
        ethers.toUtf8Bytes("REQUEST-001")
      );

      const block = await ethers.provider.getBlock("latest");

      const deadline = BigInt(
        block!.timestamp + 3600
      );

      const signatures = await createApprovalSignatures(
        address,
        requestId,
        lineId,
        holder,
        operator,
        verifier,
        deadline
      );

      await expect(
        simi
          .connect(randomUser)
          .authorizeRequest(
            {
              requestId,
              lineId,
              deadline,
            },
            signatures.operatorSignature,
            signatures.verifierSignature,
            signatures.holderSignature
          )
      ).to.emit(
        simi,
        "RequestAuthorized"
      );

      expect(
        await simi.finalizedRequests(requestId)
      ).to.equal(true);

      const request = await simi.getRequest(
        requestId
      );

      expect(
        request.requestId
      ).to.equal(requestId);

      expect(
        request.lineId
      ).to.equal(lineId);

      expect(
        request.operatorAddress
      ).to.equal(operator.address);

      expect(
        request.verifierAddress
      ).to.equal(verifier.address);

      expect(
        request.holder
      ).to.equal(holder.address);

      expect(
        request.status
      ).to.equal(1);

      expect(
        await simi.getRequestCount()
      ).to.equal(1);
    });

    it("Does not allow the same request to be finalized twice", async function () {
      const {
        simi,
        address,
        operator,
        verifier,
        holder,
        lineId,
      } = await networkHelpers.loadFixture(deployFixture);

      const requestId = ethers.keccak256(
        ethers.toUtf8Bytes("REQUEST-REPLAY")
      );

      const block = await ethers.provider.getBlock("latest");

      const deadline = BigInt(
        block!.timestamp + 3600
      );

      const signatures = await createApprovalSignatures(
        address,
        requestId,
        lineId,
        holder,
        operator,
        verifier,
        deadline
      );

      const data = {
        requestId,
        lineId,
        deadline,
      };

      await simi.authorizeRequest(
        data,
        signatures.operatorSignature,
        signatures.verifierSignature,
        signatures.holderSignature
      );

      await expect(
        simi.authorizeRequest(
          data,
          signatures.operatorSignature,
          signatures.verifierSignature,
          signatures.holderSignature
        )
      ).to.be.revertedWith(
        "Request already finalized"
      );
    });
  });

  /*//////////////////////////////////////////////////////////////
                       INVALID SIGNATURES
  //////////////////////////////////////////////////////////////*/

  describe("Signature validation", function () {
    it("Rejects an operator signature from an unauthorized wallet", async function () {
      const {
        simi,
        address,
        verifier,
        holder,
        randomUser,
        lineId,
      } = await networkHelpers.loadFixture(deployFixture);

      const requestId = ethers.keccak256(
        ethers.toUtf8Bytes("INVALID-OPERATOR")
      );

      const block = await ethers.provider.getBlock("latest");

      const deadline = BigInt(
        block!.timestamp + 3600
      );

      const domain = await getDomain(address);

      const value = {
        requestId,
        lineId,
        holder: holder.address,
        deadline,
      };

      const invalidOperatorSignature =
        await randomUser.signTypedData(
          domain,
          approvalTypes,
          value
        );

      const verifierSignature =
        await verifier.signTypedData(
          domain,
          approvalTypes,
          value
        );

      const holderSignature =
        await holder.signTypedData(
          domain,
          approvalTypes,
          value
        );

      await expect(
        simi.authorizeRequest(
          {
            requestId,
            lineId,
            deadline,
          },
          invalidOperatorSignature,
          verifierSignature,
          holderSignature
        )
      ).to.be.revertedWith(
        "Invalid operator signature"
      );
    });

    it("Rejects a verifier signature from an unauthorized wallet", async function () {
      const {
        simi,
        address,
        operator,
        holder,
        randomUser,
        lineId,
      } = await networkHelpers.loadFixture(deployFixture);

      const requestId = ethers.keccak256(
        ethers.toUtf8Bytes("INVALID-VERIFIER")
      );

      const block = await ethers.provider.getBlock("latest");

      const deadline = BigInt(
        block!.timestamp + 3600
      );

      const domain = await getDomain(address);

      const value = {
        requestId,
        lineId,
        holder: holder.address,
        deadline,
      };

      const operatorSignature =
        await operator.signTypedData(
          domain,
          approvalTypes,
          value
        );

      const invalidVerifierSignature =
        await randomUser.signTypedData(
          domain,
          approvalTypes,
          value
        );

      const holderSignature =
        await holder.signTypedData(
          domain,
          approvalTypes,
          value
        );

      await expect(
        simi.authorizeRequest(
          {
            requestId,
            lineId,
            deadline,
          },
          operatorSignature,
          invalidVerifierSignature,
          holderSignature
        )
      ).to.be.revertedWith(
        "Invalid verifier signature"
      );
    });

    it("Rejects confirmation signed by a wallet that is not the holder", async function () {
      const {
        simi,
        address,
        operator,
        verifier,
        holder,
        randomUser,
        lineId,
      } = await networkHelpers.loadFixture(deployFixture);

      const requestId = ethers.keccak256(
        ethers.toUtf8Bytes("INVALID-HOLDER")
      );

      const block = await ethers.provider.getBlock("latest");

      const deadline = BigInt(
        block!.timestamp + 3600
      );

      const domain = await getDomain(address);

      const value = {
        requestId,
        lineId,
        holder: holder.address,
        deadline,
      };

      const operatorSignature =
        await operator.signTypedData(
          domain,
          approvalTypes,
          value
        );

      const verifierSignature =
        await verifier.signTypedData(
          domain,
          approvalTypes,
          value
        );

      const invalidHolderSignature =
        await randomUser.signTypedData(
          domain,
          approvalTypes,
          value
        );

      await expect(
        simi.authorizeRequest(
          {
            requestId,
            lineId,
            deadline,
          },
          operatorSignature,
          verifierSignature,
          invalidHolderSignature
        )
      ).to.be.revertedWith(
        "Invalid holder signature"
      );
    });

    it("Rejects expired approvals", async function () {
      const {
        simi,
        address,
        operator,
        verifier,
        holder,
        lineId,
      } = await networkHelpers.loadFixture(deployFixture);

      const requestId = ethers.keccak256(
        ethers.toUtf8Bytes("EXPIRED-REQUEST")
      );

      const block = await ethers.provider.getBlock("latest");

      const deadline = BigInt(
        block!.timestamp - 10
      );

      const signatures = await createApprovalSignatures(
        address,
        requestId,
        lineId,
        holder,
        operator,
        verifier,
        deadline
      );

      await expect(
        simi.authorizeRequest(
          {
            requestId,
            lineId,
            deadline,
          },
          signatures.operatorSignature,
          signatures.verifierSignature,
          signatures.holderSignature
        )
      ).to.be.revertedWith(
        "Approval expired"
      );
    });
  });

  /*//////////////////////////////////////////////////////////////
                         DISPUTE FLOW
  //////////////////////////////////////////////////////////////*/

  describe("Dispute flow", function () {
    it("Holder can dispute a request with an off-chain signature", async function () {
      const {
        simi,
        address,
        holder,
        randomUser,
        lineId,
      } = await networkHelpers.loadFixture(deployFixture);

      const requestId = ethers.keccak256(
        ethers.toUtf8Bytes("DISPUTE-001")
      );

      const block = await ethers.provider.getBlock("latest");

      const deadline = BigInt(
        block!.timestamp + 3600
      );

      const holderSignature = await createDisputeSignature(
        address,
        requestId,
        lineId,
        holder,
        deadline
      );

      await expect(
        simi
          .connect(randomUser)
          .disputeRequest(
            {
              requestId,
              lineId,
              deadline,
            },
            holderSignature
          )
      ).to.emit(
        simi,
        "RequestDisputed"
      );

      const request = await simi.getRequest(
        requestId
      );

      expect(
        request.status
      ).to.equal(2);

      expect(
        request.holder
      ).to.equal(holder.address);

      expect(
        await simi.finalizedRequests(requestId)
      ).to.equal(true);
    });

    it("Another wallet cannot forge the holder dispute", async function () {
      const {
        simi,
        address,
        holder,
        randomUser,
        lineId,
      } = await networkHelpers.loadFixture(deployFixture);

      const requestId = ethers.keccak256(
        ethers.toUtf8Bytes("INVALID-DISPUTE")
      );

      const block = await ethers.provider.getBlock("latest");

      const deadline = BigInt(
        block!.timestamp + 3600
      );

      const domain = await getDomain(address);

      const value = {
        requestId,
        lineId,
        holder: holder.address,
        deadline,
      };

      const fakeSignature =
        await randomUser.signTypedData(
          domain,
          disputeTypes,
          value
        );

      await expect(
        simi.disputeRequest(
          {
            requestId,
            lineId,
            deadline,
          },
          fakeSignature
        )
      ).to.be.revertedWith(
        "Invalid holder signature"
      );
    });

    it("A disputed request cannot later be authorized", async function () {
      const {
        simi,
        address,
        operator,
        verifier,
        holder,
        lineId,
      } = await networkHelpers.loadFixture(deployFixture);

      const requestId = ethers.keccak256(
        ethers.toUtf8Bytes("DISPUTED-THEN-AUTH")
      );

      const block = await ethers.provider.getBlock("latest");

      const deadline = BigInt(
        block!.timestamp + 3600
      );

      const disputeSignature =
        await createDisputeSignature(
          address,
          requestId,
          lineId,
          holder,
          deadline
        );

      await simi.disputeRequest(
        {
          requestId,
          lineId,
          deadline,
        },
        disputeSignature
      );

      const signatures = await createApprovalSignatures(
        address,
        requestId,
        lineId,
        holder,
        operator,
        verifier,
        deadline
      );

      await expect(
        simi.authorizeRequest(
          {
            requestId,
            lineId,
            deadline,
          },
          signatures.operatorSignature,
          signatures.verifierSignature,
          signatures.holderSignature
        )
      ).to.be.revertedWith(
        "Request already finalized"
      );
    });
  });

  /*//////////////////////////////////////////////////////////////
                         DIGEST CHECK
  //////////////////////////////////////////////////////////////*/

  describe("EIP-712 digest", function () {
    it("Contract digest matches the Ethers EIP-712 digest", async function () {
      const {
        simi,
        address,
        holder,
        lineId,
      } = await networkHelpers.loadFixture(deployFixture);

      const requestId = ethers.keccak256(
        ethers.toUtf8Bytes("DIGEST-CHECK")
      );

      const block = await ethers.provider.getBlock("latest");

      const deadline = BigInt(
        block!.timestamp + 3600
      );

      const domain = await getDomain(address);

      const value = {
        requestId,
        lineId,
        holder: holder.address,
        deadline,
      };

      const ethersDigest =
        ethers.TypedDataEncoder.hash(
          domain,
          approvalTypes,
          value
        );

      const contractDigest =
        await simi.getApprovalDigest(
          requestId,
          lineId,
          deadline
        );

      expect(
        contractDigest
      ).to.equal(ethersDigest);
    });
  });

  /*//////////////////////////////////////////////////////////////
                       GAS MEASUREMENT
  //////////////////////////////////////////////////////////////*/

  describe("Gas measurement", function () {
    it("Measures gas used by V2 authorization", async function () {
      const {
        simi,
        address,
        operator,
        verifier,
        holder,
        randomUser,
        lineId,
      } = await networkHelpers.loadFixture(deployFixture);

      const requestId = ethers.keccak256(
        ethers.toUtf8Bytes("GAS-TEST-V2")
      );

      const block = await ethers.provider.getBlock("latest");

      const deadline = BigInt(
        block!.timestamp + 3600
      );

      const signatures = await createApprovalSignatures(
        address,
        requestId,
        lineId,
        holder,
        operator,
        verifier,
        deadline
      );

      const tx = await simi
        .connect(randomUser)
        .authorizeRequest(
          {
            requestId,
            lineId,
            deadline,
          },
          signatures.operatorSignature,
          signatures.verifierSignature,
          signatures.holderSignature
        );

      const receipt = await tx.wait();

      if (!receipt) {
        throw new Error(
          "No transaction receipt received"
        );
      }

      const gasUsed = receipt.gasUsed;

      const fs = await import("node:fs");

      const gasReport = `
      SIMI V2 - GAS REPORT
      ====================
      authorizeRequest gas used: ${gasUsed.toString()}
      Transactions in normal V2 flow: 1
      `;

      fs.writeFileSync(
        "simi-v2-gas-report.txt",
        gasReport
      );

      process.stdout.write(gasReport);

      expect(
        gasUsed
      ).to.be.greaterThan(0n);
    });
  });
});