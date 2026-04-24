'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STAGES = ['Discovery', 'Scope Alignment', 'Commitment', 'Contracting', 'Delivery', 'No Feedback'];

export default function StatusSelectorClient({ partnerId, initialStage }: { partnerId: string, initialStage: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStage = e.target.value;
    if (newStage === initialStage) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/partners/${partnerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overallStage: newStage })
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <select 
      value={initialStage}
      onChange={handleStageChange}
      disabled={loading}
      style={{
        background: 'var(--primary)',
        color: 'var(--white)',
        border: 'none',
        borderRadius: 'var(--radius-sm)',
        padding: '4px 8px',
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        cursor: 'pointer',
        outline: 'none',
        opacity: loading ? 0.7 : 1
      }}
    >
      {STAGES.map(stage => (
        <option key={stage} value={stage}>{stage}</option>
      ))}
    </select>
  );
}
