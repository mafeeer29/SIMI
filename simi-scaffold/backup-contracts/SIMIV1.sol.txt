// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title SIMI
 * @notice Capa de autorización y trazabilidad para solicitudes
 *         de reemplazo de SIM.
 *
 * @dev El contrato NO almacena números telefónicos, DNI,
 *      biometría ni otros datos personales.
 *
 *      La verificación de identidad ocurre fuera de la blockchain.
 *      Un verificador autorizado únicamente registra que dicha
 *      verificación fue realizada correctamente.
 */
contract SIMI is AccessControl {
    /*//////////////////////////////////////////////////////////////
                                ROLES
    //////////////////////////////////////////////////////////////*/

    bytes32 public constant OPERATOR_ROLE =
        keccak256("OPERATOR_ROLE");

    bytes32 public constant VERIFIER_ROLE =
        keccak256("VERIFIER_ROLE");

    /*//////////////////////////////////////////////////////////////
                              ENUMS
    //////////////////////////////////////////////////////////////*/

    enum RequestStatus {
        Created,
        IdentityVerified,
        Authorized,
        Disputed
    }

    /*//////////////////////////////////////////////////////////////
                              STRUCTS
    //////////////////////////////////////////////////////////////*/

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

    /*//////////////////////////////////////////////////////////////
                              STORAGE
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice ID que se asignará a la siguiente solicitud.
     * @dev Comienza en 1 para reservar 0 como valor nulo.
     */
    uint256 public nextRequestId = 1;

    /**
     * @notice Relaciona un identificador pseudónimo de línea
     *         con la wallet de su titular.
     */
    mapping(bytes32 => address) public lineHolders;

    /**
     * @notice Almacena las solicitudes por ID.
     */
    mapping(uint256 => SimRequest) private requests;

    /**
     * @notice Solicitud activa de cada línea.
     *
     * 0 significa que la línea no tiene una solicitud activa.
     */
    mapping(bytes32 => uint256) public activeRequestByLine;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

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

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /*//////////////////////////////////////////////////////////////
                        LINE ADMINISTRATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Registra una línea pseudónima y la vincula
     *         con la wallet de su titular.
     */
    function registerLine(
        bytes32 lineId,
        address holder
    )
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(
            lineId != bytes32(0),
            "Invalid line ID"
        );

        require(
            holder != address(0),
            "Invalid holder"
        );

        require(
            lineHolders[lineId] == address(0),
            "Line already registered"
        );

        lineHolders[lineId] = holder;

        emit LineRegistered(
            lineId,
            holder
        );
    }

    /*//////////////////////////////////////////////////////////////
                        REQUEST CREATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Crea una solicitud de reemplazo de SIM.
     *
     * @dev Solo puede hacerlo una wallet con OPERATOR_ROLE.
     *      Una linea no puede tener dos solicitudes activas.
     */
    function createRequest(
        bytes32 lineId
    )
        external
        onlyRole(OPERATOR_ROLE)
        returns (uint256)
    {
        address holder = lineHolders[lineId];

        require(
            holder != address(0),
            "Line not registered"
        );

        require(
            activeRequestByLine[lineId] == 0,
            "Line already has active request"
        );

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

        activeRequestByLine[lineId] = requestId;

        emit RequestCreated(
            requestId,
            lineId,
            msg.sender,
            holder
        );

        return requestId;
    }

    /*//////////////////////////////////////////////////////////////
                      IDENTITY VERIFICATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Registra que la identidad fue validada
     *         mediante un proceso externo autorizado.
     */
    function verifyIdentity(
        uint256 requestId
    )
        external
        onlyRole(VERIFIER_ROLE)
    {
        SimRequest storage request =
            requests[requestId];

        require(
            request.id != 0,
            "Request does not exist"
        );

        require(
            !request.disputed,
            "Request disputed"
        );

        require(
            !request.identityVerified,
            "Identity already verified"
        );

        require(
            request.status == RequestStatus.Created,
            "Invalid request status"
        );

        request.identityVerified = true;

        request.status =
            RequestStatus.IdentityVerified;

        emit IdentityVerified(
            requestId,
            msg.sender
        );
    }

    /*//////////////////////////////////////////////////////////////
                        HOLDER CONFIRMATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Permite al titular autorizar una solicitud
     *         cuya identidad ya fue verificada.
     */
    function confirmRequest(
        uint256 requestId
    )
        external
    {
        SimRequest storage request =
            requests[requestId];

        require(
            request.id != 0,
            "Request does not exist"
        );

        require(
            msg.sender == request.holder,
            "Only holder can confirm"
        );

        require(
            !request.disputed,
            "Request disputed"
        );

        require(
            request.identityVerified,
            "Identity not verified"
        );

        require(
            !request.holderConfirmed,
            "Already confirmed"
        );

        require(
            request.status ==
                RequestStatus.IdentityVerified,
            "Invalid request status"
        );

        request.holderConfirmed = true;

        request.status =
            RequestStatus.Authorized;

        /*
         * La solicitud termina.
         * La linea queda disponible para una futura solicitud.
         */
        activeRequestByLine[
            request.lineId
        ] = 0;

        emit HolderConfirmed(
            requestId,
            msg.sender
        );

        emit RequestAuthorized(
            requestId
        );
    }

    /*//////////////////////////////////////////////////////////////
                              DISPUTE
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Permite al titular bloquear una solicitud
     *         que no reconoce.
     */
    function disputeRequest(
        uint256 requestId
    )
        external
    {
        SimRequest storage request =
            requests[requestId];

        require(
            request.id != 0,
            "Request does not exist"
        );

        require(
            msg.sender == request.holder,
            "Only holder can dispute"
        );

        require(
            request.status !=
                RequestStatus.Authorized,
            "Already authorized"
        );

        require(
            !request.disputed,
            "Already disputed"
        );

        request.disputed = true;

        request.status =
            RequestStatus.Disputed;

        /*
         * La solicitud termina,
         * por lo que se libera la linea.
         */
        activeRequestByLine[
            request.lineId
        ] = 0;

        emit RequestDisputed(
            requestId,
            msg.sender
        );
    }

    /*//////////////////////////////////////////////////////////////
                              GETTERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Obtiene toda la información blockchain
     *         de una solicitud.
     */
    function getRequest(
        uint256 requestId
    )
        external
        view
        returns (SimRequest memory)
    {
        SimRequest memory request =
            requests[requestId];

        require(
            request.id != 0,
            "Request does not exist"
        );

        return request;
    }

    /**
     * @notice Devuelve la cantidad total de solicitudes creadas.
     */
    function getRequestCount()
        external
        view
        returns (uint256)
    {
        return nextRequestId - 1;
    }
}