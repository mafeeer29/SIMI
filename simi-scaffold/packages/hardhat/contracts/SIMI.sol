// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title SIMI
 * @notice Capa de autorización y trazabilidad para solicitudes
 *         de reemplazo de SIM.
 *
 * @dev V2:
 *      - Los datos personales permanecen off-chain.
 *      - Operadora, verificador y titular firman off-chain.
 *      - Solo el resultado crítico se registra on-chain.
 *      - El flujo normal requiere una única transacción.
 */
contract SIMI is AccessControl, EIP712 {
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
        None,
        Authorized,
        Disputed
    }

    /*//////////////////////////////////////////////////////////////
                              STRUCTS
    //////////////////////////////////////////////////////////////*/

    struct SimRequest {
        bytes32 requestId;
        bytes32 lineId;
        address operatorAddress;
        address verifierAddress;
        address holder;
        uint256 finalizedAt;
        RequestStatus status;
    }

    struct AuthorizationData {
        bytes32 requestId;
        bytes32 lineId;
        uint256 deadline;
    }

    /*//////////////////////////////////////////////////////////////
                         EIP-712 TYPE HASHES
    //////////////////////////////////////////////////////////////*/

    bytes32 public constant APPROVAL_TYPEHASH =
        keccak256(
            "Approval(bytes32 requestId,bytes32 lineId,address holder,uint256 deadline)"
        );

    bytes32 public constant DISPUTE_TYPEHASH =
        keccak256(
            "Dispute(bytes32 requestId,bytes32 lineId,address holder,uint256 deadline)"
        );

    /*//////////////////////////////////////////////////////////////
                              STORAGE
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Identificador pseudónimo de línea => titular.
     *
     * @dev No almacenar aquí teléfono, DNI ni otros datos personales.
     */
    mapping(bytes32 => address) public lineHolders;

    /**
     * @notice Resultado final de las solicitudes procesadas.
     */
    mapping(bytes32 => SimRequest) private requests;

    /**
     * @notice Evita que un requestId pueda procesarse más de una vez.
     */
    mapping(bytes32 => bool) public finalizedRequests;

    /**
     * @notice Cantidad total de solicitudes finalizadas on-chain.
     */
    uint256 public requestCount;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event LineRegistered(
        bytes32 indexed lineId,
        address indexed holder
    );

    event RequestAuthorized(
        bytes32 indexed requestId,
        bytes32 indexed lineId,
        address indexed holder,
        address operatorAddress,
        address verifierAddress
    );

    event RequestDisputed(
        bytes32 indexed requestId,
        bytes32 indexed lineId,
        address indexed holder
    );

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor()
        EIP712("SIMI", "2")
    {
        _grantRole(
            DEFAULT_ADMIN_ROLE,
            msg.sender
        );
    }

    /*//////////////////////////////////////////////////////////////
                        LINE ADMINISTRATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Registra un identificador pseudónimo de línea
     *         y lo vincula con el titular correspondiente.
     *
     * @dev Es una operación de enrolamiento/configuración.
     *      No ocurre en cada reposición.
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
                      FINAL AUTHORIZATION
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Registra una reposición como autorizada.
     *
     * @dev Las tres aprobaciones se realizan off-chain.
     *      La única escritura blockchain del flujo normal ocurre aquí.
     *
     *      Deben existir firmas válidas de:
     *      - Operadora autorizada
     *      - Verificador autorizado
     *      - Titular de la línea
     */
    function authorizeRequest(
        AuthorizationData calldata data,
        bytes calldata operatorSignature,
        bytes calldata verifierSignature,
        bytes calldata holderSignature
    )
        external
    {
        require(
            data.requestId != bytes32(0),
            "Invalid request ID"
        );

        require(
            !finalizedRequests[data.requestId],
            "Request already finalized"
        );

        require(
            block.timestamp <= data.deadline,
            "Approval expired"
        );

        address holder =
            lineHolders[data.lineId];

        require(
            holder != address(0),
            "Line not registered"
        );

        bytes32 digest =
            _getApprovalDigest(
                data.requestId,
                data.lineId,
                holder,
                data.deadline
            );

        (
            address operatorSigner,
            address verifierSigner
        ) =
            _validateAuthorizationSignatures(
                digest,
                holder,
                operatorSignature,
                verifierSignature,
                holderSignature
            );

        _finalizeAuthorization(
            data.requestId,
            data.lineId,
            holder,
            operatorSigner,
            verifierSigner
        );
    }

    /**
     * @dev Valida las firmas y devuelve los firmantes
     *      de operadora y verificador.
     */
    function _validateAuthorizationSignatures(
        bytes32 digest,
        address holder,
        bytes calldata operatorSignature,
        bytes calldata verifierSignature,
        bytes calldata holderSignature
    )
        internal
        view
        returns (
            address operatorSigner,
            address verifierSigner
        )
    {
        operatorSigner =
            ECDSA.recover(
                digest,
                operatorSignature
            );

        require(
            hasRole(
                OPERATOR_ROLE,
                operatorSigner
            ),
            "Invalid operator signature"
        );

        verifierSigner =
            ECDSA.recover(
                digest,
                verifierSignature
            );

        require(
            hasRole(
                VERIFIER_ROLE,
                verifierSigner
            ),
            "Invalid verifier signature"
        );

        address holderSigner =
            ECDSA.recover(
                digest,
                holderSignature
            );

        require(
            holderSigner == holder,
            "Invalid holder signature"
        );
    }

    /**
     * @dev Registra definitivamente una autorización válida.
     */
    function _finalizeAuthorization(
        bytes32 requestId,
        bytes32 lineId,
        address holder,
        address operatorSigner,
        address verifierSigner
    )
        internal
    {
        finalizedRequests[
            requestId
        ] = true;

        requests[
            requestId
        ] = SimRequest({
            requestId: requestId,
            lineId: lineId,
            operatorAddress: operatorSigner,
            verifierAddress: verifierSigner,
            holder: holder,
            finalizedAt: block.timestamp,
            status: RequestStatus.Authorized
        });

        requestCount++;

        emit RequestAuthorized(
            requestId,
            lineId,
            holder,
            operatorSigner,
            verifierSigner
        );
    }

    /*//////////////////////////////////////////////////////////////
                              DISPUTE
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Registra que el titular NO reconoce la solicitud.
     *
     * @dev El titular firma la disputa off-chain.
     *      Cualquier relayer/backend puede enviar la transacción,
     *      por lo que el usuario no tiene que pagar gas directamente.
     */
    function disputeRequest(
        AuthorizationData calldata data,
        bytes calldata holderSignature
    )
        external
    {
        require(
            data.requestId != bytes32(0),
            "Invalid request ID"
        );

        require(
            !finalizedRequests[data.requestId],
            "Request already finalized"
        );

        require(
            block.timestamp <= data.deadline,
            "Dispute expired"
        );

        address holder =
            lineHolders[data.lineId];

        require(
            holder != address(0),
            "Line not registered"
        );

        bytes32 digest =
            _getDisputeDigest(
                data.requestId,
                data.lineId,
                holder,
                data.deadline
            );

        address holderSigner =
            ECDSA.recover(
                digest,
                holderSignature
            );

        require(
            holderSigner == holder,
            "Invalid holder signature"
        );

        finalizedRequests[
            data.requestId
        ] = true;

        requests[
            data.requestId
        ] = SimRequest({
            requestId: data.requestId,
            lineId: data.lineId,
            operatorAddress: address(0),
            verifierAddress: address(0),
            holder: holder,
            finalizedAt: block.timestamp,
            status: RequestStatus.Disputed
        });

        requestCount++;

        emit RequestDisputed(
            data.requestId,
            data.lineId,
            holder
        );
    }

    /*//////////////////////////////////////////////////////////////
                         INTERNAL DIGEST HELPERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Construye el digest EIP-712 para una autorización.
     */
    function _getApprovalDigest(
        bytes32 requestId,
        bytes32 lineId,
        address holder,
        uint256 deadline
    )
        internal
        view
        returns (bytes32)
    {
        bytes32 structHash =
            keccak256(
                abi.encode(
                    APPROVAL_TYPEHASH,
                    requestId,
                    lineId,
                    holder,
                    deadline
                )
            );

        return
            _hashTypedDataV4(
                structHash
            );
    }

    /**
     * @dev Construye el digest EIP-712 para una disputa.
     */
    function _getDisputeDigest(
        bytes32 requestId,
        bytes32 lineId,
        address holder,
        uint256 deadline
    )
        internal
        view
        returns (bytes32)
    {
        bytes32 structHash =
            keccak256(
                abi.encode(
                    DISPUTE_TYPEHASH,
                    requestId,
                    lineId,
                    holder,
                    deadline
                )
            );

        return
            _hashTypedDataV4(
                structHash
            );
    }

    /*//////////////////////////////////////////////////////////////
                         PUBLIC DIGEST HELPERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Devuelve el digest que operadora, verificador
     *         y titular deben firmar para autorizar.
     */
    function getApprovalDigest(
        bytes32 requestId,
        bytes32 lineId,
        uint256 deadline
    )
        external
        view
        returns (bytes32)
    {
        address holder =
            lineHolders[lineId];

        require(
            holder != address(0),
            "Line not registered"
        );

        return
            _getApprovalDigest(
                requestId,
                lineId,
                holder,
                deadline
            );
    }

    /**
     * @notice Devuelve el digest que el titular debe firmar
     *         para disputar una solicitud.
     */
    function getDisputeDigest(
        bytes32 requestId,
        bytes32 lineId,
        uint256 deadline
    )
        external
        view
        returns (bytes32)
    {
        address holder =
            lineHolders[lineId];

        require(
            holder != address(0),
            "Line not registered"
        );

        return
            _getDisputeDigest(
                requestId,
                lineId,
                holder,
                deadline
            );
    }

    /*//////////////////////////////////////////////////////////////
                              GETTERS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Obtiene el resultado blockchain de una solicitud.
     */
    function getRequest(
        bytes32 requestId
    )
        external
        view
        returns (SimRequest memory)
    {
        require(
            finalizedRequests[requestId],
            "Request does not exist"
        );

        return
            requests[requestId];
    }

    /**
     * @notice Devuelve la cantidad total de solicitudes
     *         finalizadas on-chain.
     */
    function getRequestCount()
        external
        view
        returns (uint256)
    {
        return requestCount;
    }
}