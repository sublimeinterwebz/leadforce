'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, AlertTriangle, X } from 'lucide-react';

export default function DeletePartnerClient({ partnerId, companyName }: { partnerId: string, companyName: string }) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/partners/${partnerId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/partners');
        router.refresh();
      } else {
        alert('Failed to delete partner.');
        setDeleting(false);
        setShowConfirm(false);
      }
    } catch (err) {
      console.error(err);
      alert('Network error while deleting partner.');
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'transparent', border: '1px solid var(--danger)',
          borderRadius: 'var(--radius-md)', padding: '8px 16px',
          fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          color: 'var(--danger)', marginTop: '24px', width: '100%',
          justifyContent: 'center',
        }}
      >
        <Trash2 size={14} /> Delete Partner
      </button>
    );
  }

  return (
    <div style={{
      background: 'var(--danger-light)', border: '1px solid var(--danger)',
      borderRadius: 'var(--radius-lg)', padding: '16px', marginTop: '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <AlertTriangle size={24} color="var(--danger)" style={{ flexShrink: 0 }} />
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--danger)', marginBottom: '4px' }}>
            Delete {companyName}?
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--neutral-700)', marginBottom: '16px', lineHeight: 1.4 }}>
            This action cannot be undone. All related products, tasks, history logs, and documents will be permanently removed.
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{
                flex: 1, padding: '10px',
                background: 'var(--danger)', color: 'var(--white)',
                border: 'none', borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem', fontWeight: 700, cursor: deleting ? 'not-allowed' : 'pointer',
                opacity: deleting ? 0.6 : 1,
              }}
            >
              {deleting ? 'DELETING...' : 'YES, DELETE'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={deleting}
              style={{
                flex: 1, padding: '10px',
                background: 'var(--white)', color: 'var(--neutral-800)',
                border: '1px solid var(--neutral-300)', borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem', fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer',
              }}
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
