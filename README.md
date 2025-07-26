
# KATA Protocol

## Project Overview


**KATA Protocol**: Cross-chain DeFi platform combining Ethereum ↔ Sui atomic swaps with advanced limit order strategies, targeting $127,000 in prizes across 3 tracks.

> **About the Name:**
> "Kata" in Japanese martial arts refers to a precise, pre-defined sequence of efficient movements. This reflects the protocol's focus on automated, programmable, and efficient strategies (like TWAP), and is a clever nod to the martial arts inspiration behind 1inch.

## 🛠️ Tech Stack

### **Blockchain Layer**

- **Ethereum**: Solidity ^0.8.19, Hardhat, OpenZeppelin
- **Sui**: Move language, Sui CLI, Sui SDK
- **Cross-Chain**: HTLC (Hashed Time Lock Contracts)

### **Backend (Minimal)**

- **API Gateway**: Next.js API routes
- **Database**: SQLite/PostgreSQL (for order history)
- **Caching**: Redis (optional for price caching)
- **External APIs**: 1inch API suite

### **Frontend**

- **Framework**: Next.js 14, React 18
- **Styling**: TailwindCSS, Framer Motion
- **Web3**: Ethers.js v6, @mysten/sui.js
- **State Management**: Zustand
- **UI Components**: Radix UI, React Hook Form

### **Development Tools**

- **Version Control**: Git, GitHub
- **Testing**: Jest, Hardhat Test, Move Unit Tests
- **Deployment**: Vercel (frontend), Alchemy/Infura (Ethereum)
- **Monitoring**: Sentry, Console logs
