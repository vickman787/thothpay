'use client';

import React, { useState, useEffect } from 'react';
import { useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { useRouter } from 'next/navigation';
import { AUTH_MESSAGE } from '@/lib/auth-message';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (address: string) => void;
}

type ConnectState = 'IDLE' | 'SIGNING' | 'VERIFYING' | 'COMPLETED';

export default function ConnectWalletModal({ isOpen, onClose, onConnected }: ConnectWalletModalProps) {
  const { connectors, connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const router = useRouter();

  const [state, setState] = useState<ConnectState>('IDLE');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setState('IDLE');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnect = async (connectorId: string) => {
    setError(null);
    try {
      const connector = connectors.find((c) => c.id === connectorId);
      if (!connector) throw new Error('Unknown wallet connector');

      setState('VERIFYING');
      const result = await connectAsync({ connector });
      const connectedAddress = result.accounts?.[0];
      if (!connectedAddress) throw new Error('Could not read wallet address after connecting');

      setState('SIGNING');
      const signature = await signMessageAsync({ message: AUTH_MESSAGE });

      setState('VERIFYING');
      const res = await fetch('/api/auth/wallet-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: connectedAddress, signature, message: AUTH_MESSAGE }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign-in failed');

      setState('COMPLETED');
      localStorage.setItem('thothpay_wallet_address', connectedAddress);
      window.dispatchEvent(new Event('wallet_changed'));
      onConnected(connectedAddress);
      setTimeout(() => router.refresh(), 300);
    } catch (err: any) {
      console.error('Connect error:', err);
      setError(err.message || 'Connection failed');
      try { await disconnect(); } catch { /* ignore */ }
      setState('IDLE');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="card-panel w-full max-w-md p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-soft-ink)] hover:text-[var(--color-ink)]"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">
            {state === 'COMPLETED' ? 'Connected' : 'Connect Wallet'}
          </h2>
          <p className="text-sm text-[var(--color-soft-ink)]">
            {state === 'SIGNING' && 'Sign the message in your wallet to prove ownership…'}
            {state === 'VERIFYING' && 'Verifying signature on Celo…'}
            {state === 'COMPLETED' && 'Wallet connected. You can now query the agent.'}
            {(state === 'IDLE') && 'Choose a wallet. You\'ll sign a free message — no transaction.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-[var(--color-rust)]/10 text-[var(--color-rust)] text-sm rounded-[2px] border border-[var(--color-rust)]">
            {error}
          </div>
        )}

        {(state === 'IDLE') && (
          <div className="flex flex-col gap-3">
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => handleConnect(connector.id)}
                className="btn btn-secondary w-full justify-between font-mono text-sm"
              >
                <span>{connector.name}</span>
                <span className="text-[var(--color-signal-green)]">▸</span>
              </button>
            ))}
          </div>
        )}

        {(state === 'SIGNING' || state === 'VERIFYING') && (
          <div className="py-8 flex flex-col items-center justify-center text-[var(--color-soft-ink)]">
            <svg className="animate-spin h-8 w-8 mb-4 text-[var(--color-signal-green)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{state === 'SIGNING' ? 'Awaiting signature…' : 'Verifying…'}</span>
          </div>
        )}

        {state === 'COMPLETED' && (
          <div className="py-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[var(--color-signal-green)]/15 text-[var(--color-signal-green)] rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <button onClick={onClose} className="mt-6 btn btn-highlight w-full">
              Start Using ThothPay
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
