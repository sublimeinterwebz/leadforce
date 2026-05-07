'use client';

import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px', textAlign: 'center' }}>
      <AlertTriangle size={48} color="var(--danger)" style={{ marginBottom: '16px' }} />
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>Something went wrong!</h2>
      <p style={{ color: 'var(--neutral-600)', marginBottom: '24px', fontSize: '0.9rem' }}>
        We encountered an unexpected error while loading this page.
      </p>
      <button
        onClick={() => reset()}
        style={{
          background: 'var(--primary)', color: 'var(--white)',
          border: 'none', padding: '10px 24px', borderRadius: 'var(--radius-full)',
          fontWeight: 700, cursor: 'pointer'
        }}
      >
        Try Again
      </button>
    </div>
  );
}
