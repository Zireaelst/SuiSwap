'use client';

import { LimitOrderDashboard } from '@/components/LimitOrderDashboard';

export default function LimitOrderPage() {
  // In a real app, you would get this from your wallet connection
  const userAddress = undefined; // Will be connected wallet address
  
  return <LimitOrderDashboard userAddress={userAddress} />;
}
