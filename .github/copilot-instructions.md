# Copilot Instructions for KATA Protocol

## Project Architecture
- **Monorepo** with three main domains:
  - `contracts/`: Blockchain smart contracts for Ethereum (Solidity/Hardhat) and Sui (Move).
  - `backend/`: Minimal Node.js backend for API aggregation, order history, and cross-chain orchestration.
  - `frontend/`: Next.js 14 app with TypeScript for user interface, wallet integration, and order management.

## Key Patterns & Conventions
- **Cross-chain logic**: Implemented via Hashed Time Lock Contracts (HTLC) in both Solidity (`contracts/ethereum/CrossChainHTLC.sol`) and Move (`contracts/sui/htlc.move`).
- **Order strategies**: Advanced limit and TWAP order logic in smart contracts and backend services.
- **API Gateway**: Use Next.js API routes (`frontend/src/app/api/`) for backend endpoints.
- **State management**: Use Zustand (`frontend/src/store/useSwapStore.ts`) for React state.
- **External APIs**: Integrate with 1inch via `utils/1inch-api.ts` in both backend and frontend.
- **Type safety**: Use TypeScript interfaces consistently; avoid `any` types where possible.
- **Component structure**: Components use named exports and follow the pattern `export const ComponentName = () => { ... }`

## Developer Workflows
- **Dependencies**: 
  - Frontend: Run `npm install` in `/frontend` for React, Next.js, ethers, etc.
  - Backend: Run `npm install` in `/backend` for Express, Prisma, ethers, etc.
- **Build & Test**
  - Ethereum: `cd contracts/ethereum && npx hardhat test`
  - Sui: `sui move test` in relevant directories
  - Frontend: `cd frontend && npm run dev`
  - Backend: `cd backend && npm run dev`
- **Deploy**
  - Ethereum: Use Hardhat Ignition (`npx hardhat ignition deploy ./ignition/modules/Lock.ts`)
  - Frontend: Deploy via Vercel
- **Database**: Use Prisma with SQLite for development; schema in `backend/prisma/schema.prisma`

## Integration Points
- **Cross-chain swaps**: Coordinated via backend services and smart contracts; see `CrossChainHTLC.sol` and `htlc.move`.
- **Order history**: Stored in backend DB via Prisma models (LimitOrder, TWAPOrder, etc.).
- **External price feeds**: 1inch API via `utils/1inch-api.ts`.
- **Wallet connections**: Use `useWallet` hook for both Ethereum and Sui wallet integration.

## File Structure Guidelines
- **Components**: Located in `frontend/components/` with TypeScript interfaces
- **Hooks**: Located in `frontend/src/hooks/` for reusable React logic
- **Services**: Located in `frontend/src/services/` and `backend/services/` for business logic
- **Types**: Located in `frontend/src/types/` for shared TypeScript interfaces
- **API routes**: Located in `frontend/src/app/api/` following Next.js 14 app router pattern

## Common Fixes
- Import paths: Use relative paths from component location (e.g., `../src/hooks/useWallet`)
- Type interfaces: Import types with `import type { Type } from 'path'`
- Missing dependencies: Add to respective package.json files
- Contract interactions: Use type assertions for contract methods when needed

## Notable Files & Directories
- `contracts/ethereum/AdvancedLimitOrderStrategy.sol`: Core Ethereum order logic
- `contracts/sui/limit_order_strategy.move`: Sui order logic
- `backend/services/CrossChainTWAPService.ts`: Backend orchestration for TWAP
- `frontend/components/`: React UI components with TypeScript
- `frontend/src/store/useSwapStore.ts`: Zustand store for swap state
- `frontend/src/hooks/useWallet.ts`: Wallet connection logic
- `backend/prisma/schema.prisma`: Database schema

## Project-specific Notes
- **Naming**: "Kata" reflects programmable, efficient strategies (see main `README.md`)
- **Minimal backend**: Most logic is on-chain or in frontend; backend is for orchestration and persistence only.
- **No monolithic server**: Use API routes and serverless functions.
- **Type safety**: Prefer proper TypeScript interfaces over `any` types
- **Component patterns**: Use functional components with hooks, avoid class components

---

For more, see the main `README.md` and contract/strategy files referenced above.
