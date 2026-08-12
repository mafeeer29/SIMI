# Arquitectura de SIMI

SIMI es una dApp enfocada en autorización verificable de reposiciones de SIM.

## Arquitectura general

```mermaid
flowchart LR
    O[Operadora] -->|Crea y firma solicitud EIP-712| F[Firestore]
    V[Verificador] -->|Firma evidencia de validación| F
    H[Titular] -->|Confirma o disputa| F

    F --> FE[Frontend SIMI]

    FE -->|Resultado final| SC[Smart Contract SIMI]
    SC --> ARB[Arbitrum Sepolia]

    O -->|Enviar alerta| API[Next.js API Route]
    API --> TW[Twilio WhatsApp Sandbox]
    TW --> H
Componentes principales
Frontend

SIMI utiliza:

Next.js
React
TypeScript
Tailwind
Scaffold-ETH
Wagmi
Viem

El frontend incluye vistas para:

Operadora
Verificador
Titular
Firmas off-chain

La operadora, el verificador y el titular generan firmas EIP-712.

Estas firmas permiten atribuir cada decisión sin requerir una transacción blockchain en cada paso.

Los estados intermedios y las firmas se gestionan fuera de cadena.

Firestore

Firestore se utiliza para sincronizar las solicitudes entre dispositivos durante el flujo.

Se almacenan datos como:

requestId
lineId
holder
firmas
estado
timestamps

No se almacenan DNI, biometría ni documentos personales.

Smart Contract

El contrato de SIMI está desplegado en Arbitrum Sepolia.

Contrato:

0xc06c111884603745d33476a671ea88183a939da6

El contrato verifica las firmas y registra el resultado final de la solicitud:

Authorized
Disputed
Alertas

Para el MVP se utiliza Twilio WhatsApp Sandbox.

Flujo:

Operadora → API de Next.js → Twilio → WhatsApp del titular

En un entorno productivo, este canal se integraría con la infraestructura empresarial de la operadora.

Flujo funcional
La operadora crea y firma la solicitud.
El verificador firma evidencia de que la identidad fue validada fuera de blockchain.
El titular recibe una alerta.
El titular confirma o disputa.
Las firmas son verificadas.
Solo el resultado final se registra en Arbitrum.
Privacidad

SIMI no almacena en blockchain:

números telefónicos
DNI
biometría
documentos personales

La blockchain se utiliza como capa de integridad y evidencia verificable del resultado final.