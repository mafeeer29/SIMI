# SIMI

SIMI es una dApp de telecomunicaciones y ciberseguridad enfocada en agregar una capa de autorización verificable al proceso de reposición de SIM.

El objetivo es reducir el riesgo de reposiciones fraudulentas o SIM swapping, permitiendo que el titular confirme o dispute una solicitud antes de que el resultado final quede registrado.

## Problema

Una reposición fraudulenta de SIM puede permitir que un atacante tome control del número de una persona y utilice ese acceso para:

- recibir códigos SMS de autenticación;
- recuperar contraseñas;
- acceder a banca;
- comprometer correos electrónicos;
- acceder a redes sociales y otros servicios vinculados al número.

SIMI parte de una idea simple:

> Validar identidad no siempre equivale a tener el consentimiento explícito del titular real.

## Solución

SIMI complementa los sistemas actuales de una operadora con un flujo de autorización verificable.

El proceso funciona así:

1. La operadora crea y firma una solicitud de reposición.
2. Un verificador registra mediante firma que la identidad fue validada fuera de blockchain.
3. El titular confirma o disputa la solicitud.
4. Solo el resultado final se registra en Arbitrum.

## Arquitectura V2

SIMI utiliza firmas EIP-712 off-chain para reducir la cantidad de interacciones blockchain.

- Operadora: firma la solicitud.
- Verificador: firma la evidencia de validación.
- Titular: confirma o disputa.
- Smart Contract: verifica las firmas y registra el resultado final.

Los estados intermedios se sincronizan mediante Firestore.

La arquitectura completa está documentada en:

[Ver arquitectura de SIMI](./docs/architecture.md)

## Demo

La demo incluye dos escenarios principales.

### Solicitud legítima

Operadora → Verificador → Alerta → Titular confirma → Autorización final en Arbitrum.

### Solicitud no reconocida

Operadora → Verificador → Alerta → Titular disputa → Reposición bloqueada.

## Alertas

Para el MVP se utiliza Twilio WhatsApp Sandbox para demostrar una alerta real al titular.

En producción, esta integración podría realizarse mediante los canales empresariales oficiales de la operadora.

## Privacidad

SIMI no almacena en blockchain:

- DNI;
- biometría;
- documentos personales;
- números telefónicos.

La blockchain se utiliza únicamente como capa de integridad y evidencia verificable del resultado final.

## Tecnologías

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS
- Scaffold-ETH 2
- Wagmi
- Viem

### Web3
- Solidity
- EIP-712
- OpenZeppelin
- Arbitrum Sepolia

### Datos y sincronización
- Firebase Firestore

### Alertas
- Twilio WhatsApp Sandbox

## Smart Contract

Red:

`Arbitrum Sepolia`

Chain ID:

`421614`

Contrato:

`0xc06c111884603745d33476a671ea88183a939da6`

## Optimización V1 → V2

La primera versión utilizaba 3 transacciones on-chain.

La versión actual utiliza firmas off-chain y una sola transacción final.

### V1

- `createRequest`
- `verifyIdentity`
- `confirmRequest`

Gas total aproximado:

`256,297`

### V2

- `authorizeRequest`

Gas aproximado:

`249,637`

La mejora principal no es el ahorro de gas, sino la reducción de:

**3 → 1 interacciones on-chain**

lo que representa aproximadamente:

**66.7 % menos interacciones blockchain**

## Pruebas

El smart contract V2 cuenta con 12 pruebas exitosas que cubren:

- registro de líneas;
- autorización válida;
- firmas inválidas;
- protección contra replay;
- expiración;
- disputa válida;
- disputa falsificada;
- bloqueo de doble finalización;
- validación del digest EIP-712.

## Modelo

SIMI está planteado como una solución B2B2C.

- Cliente: operadora de telecomunicaciones.
- Usuario protegido: titular de la línea.

SIMI no busca reemplazar los sistemas internos de la operadora, sino integrarse como una capa adicional de autorización y evidencia.

## Estado del MVP

Actualmente está implementado:

- smart contract V2;
- despliegue en Arbitrum Sepolia;
- roles de operadora y verificador;
- registro de líneas;
- firmas EIP-712;
- autorización;
- disputa;
- dashboards por rol;
- Firestore;
- sincronización entre dispositivos;
- alerta real por WhatsApp Sandbox;
- frontend desplegado en Vercel;
- flujo legítimo;
- flujo de disputa.

## Demo en vivo

Aplicación:

https://simi-liard.vercel.app/simi

## Alcance futuro

Para un entorno productivo sería necesario integrar SIMI con:

- sistemas internos de una operadora;
- mecanismos reales de KYC;
- canales empresariales de alerta;
- abstracción de wallets;
- controles de acceso productivos;
- políticas de recuperación y seguridad;
- auditoría y monitoreo.

## Mensaje central

> Antes de que una reposición de SIM cambie el control de una línea, el titular debe poder decidir.

SIMI agrega una capa verificable de consentimiento y evidencia sin almacenar datos personales sensibles en blockchain.