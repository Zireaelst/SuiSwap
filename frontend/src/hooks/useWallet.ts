import { useState } from 'react';
import { ethers } from 'ethers';
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

// Extend Window interface for MetaMask
declare global {
    interface Window {
        ethereum?: {
            request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
            on: (event: string, handler: (...args: unknown[]) => void) => void;
            removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
        };
    }
}

interface WalletState {
    isConnected: boolean;
    ethAddress: string | null;
    suiAddress: string | null;
    ethBalance: string;
    suiBalance: string;
    ethProvider: ethers.BrowserProvider | null;
    suiProvider: SuiClient | null;
}

export const useWallet = () => {
    const [wallet, setWallet] = useState<WalletState>({
        isConnected: false,
        ethAddress: null,
        suiAddress: null,
        ethBalance: '0',
        suiBalance: '0',
        ethProvider: null,
        suiProvider: null
    });

    const connectEthereumWallet = async () => {
        if (typeof window !== 'undefined' && window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const address = await signer.getAddress();
                const balance = await provider.getBalance(address);

                setWallet(prev => ({
                    ...prev,
                    ethProvider: provider,
                    ethAddress: address,
                    ethBalance: ethers.formatEther(balance),
                    isConnected: true
                }));
            } catch (error) {
                console.error('Failed to connect Ethereum wallet:', error);
            }
        }
    };

    const connectSuiWallet = async () => {
        try {
            const provider = new SuiClient({
                url: process.env.NEXT_PUBLIC_SUI_RPC_URL!
            });

            // For demo - in production, use proper Sui wallet adapter
            const keypair = Ed25519Keypair.generate();
            const address = keypair.toSuiAddress();

            setWallet(prev => ({
                ...prev,
                suiProvider: provider,
                suiAddress: address,
                suiBalance: '0', // Get from provider
                isConnected: true
            }));
        } catch (error) {
            console.error('Failed to connect Sui wallet:', error);
        }
    };

    const disconnect = () => {
        setWallet({
            isConnected: false,
            ethAddress: null,
            suiAddress: null,
            ethBalance: '0',
            suiBalance: '0',
            ethProvider: null,
            suiProvider: null
        });
    };

    return {
        ...wallet,
        connectEthereumWallet,
        connectSuiWallet,
        disconnect
    };
};
