// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract SIMI is AccessControl {
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    enum RequestStatus {
        Created,
        IdentityVerified,
        Authorized,
        Disputed
    }

    struct SimRequest {
        uint256 id;
        bytes32 lineId;
        address operatorAddress;
        address holder;
        uint256 createdAt;
        bool identityVerified;
        bool holderConfirmed;
        bool disputed;
        RequestStatus status;
    }

    uint256 private nextRequestId;

    mapping(bytes32 => address) public lineHolders;
    mapping(uint256 => SimRequest) private requests;

    event LineRegistered(
        bytes32 indexed lineId,
        address indexed holder
    );

    event RequestCreated(
        uint256 indexed requestId,
        bytes32 indexed lineId,
        address indexed operator,
        address holder
    );

    event IdentityVerified(
        uint256 indexed requestId,
        address indexed verifier
    );

    event HolderConfirmed(
        uint256 indexed requestId,
        address indexed holder
    );

    event RequestAuthorized(
        uint256 indexed requestId
    );

    event RequestDisputed(
        uint256 indexed requestId,
        address indexed holder
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function registerLine(
        bytes32 lineId,
        address holder
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(lineId != bytes32(0), "Invalid line ID");
        require(holder != address(0), "Invalid holder");
        require(lineHolders[lineId] == address(0), "Line already registered");

        lineHolders[lineId] = holder;

        emit LineRegistered(lineId, holder);
    }

    function createRequest(
        bytes32 lineId
    ) external onlyRole(OPERATOR_ROLE) returns (uint256) {
        address holder = lineHolders[lineId];

        require(holder != address(0), "Line not registered");

        uint256 requestId = nextRequestId;
        nextRequestId++;

        requests[requestId] = SimRequest({
            id: requestId,
            lineId: lineId,
            operatorAddress: msg.sender,
            holder: holder,
            createdAt: block.timestamp,
            identityVerified: false,
            holderConfirmed: false,
            disputed: false,
            status: RequestStatus.Created
        });

        emit RequestCreated(
            requestId,
            lineId,
            msg.sender,
            holder
        );

        return requestId;
    }

    function verifyIdentity(
        uint256 requestId
    ) external onlyRole(VERIFIER_ROLE) {
        SimRequest storage request = requests[requestId];

        require(request.holder != address(0), "Request does not exist");
        require(!request.disputed, "Request disputed");
        require(!request.identityVerified, "Identity already verified");
        require(request.status == RequestStatus.Created, "Invalid request status");

        request.identityVerified = true;
        request.status = RequestStatus.IdentityVerified;

        emit IdentityVerified(requestId, msg.sender);
    }

    function confirmRequest(
        uint256 requestId
    ) external {
        SimRequest storage request = requests[requestId];

        require(request.holder != address(0), "Request does not exist");
        require(msg.sender == request.holder, "Only holder can confirm");
        require(!request.disputed, "Request disputed");
        require(request.identityVerified, "Identity not verified");
        require(!request.holderConfirmed, "Already confirmed");
        require(request.status == RequestStatus.IdentityVerified, "Invalid request status");

        request.holderConfirmed = true;
        request.status = RequestStatus.Authorized;

        emit HolderConfirmed(requestId, msg.sender);
        emit RequestAuthorized(requestId);
    }

    function disputeRequest(
        uint256 requestId
    ) external {
        SimRequest storage request = requests[requestId];

        require(request.holder != address(0), "Request does not exist");
        require(msg.sender == request.holder, "Only holder can dispute");
        require(request.status != RequestStatus.Authorized, "Already authorized");
        require(!request.disputed, "Already disputed");

        request.disputed = true;
        request.status = RequestStatus.Disputed;

        emit RequestDisputed(requestId, msg.sender);
    }

    function getRequest(
        uint256 requestId
    ) external view returns (SimRequest memory) {
        SimRequest memory request = requests[requestId];

        require(request.holder != address(0), "Request does not exist");

        return request;
    }
}