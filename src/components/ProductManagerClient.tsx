'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

export default function ProductManagerClient({ 
  partnerId, 
  currentProducts, 
  allProducts 
}: { 
  partnerId: string;
  currentProducts: any[];
  allProducts: any[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedStage, setSelectedStage] = useState('Discovery');

  const STAGES = ['Discovery', 'Scope Alignment', 'Commitment', 'Contracting', 'Delivery', 'No Feedback'];

  const handleUpdate = async (productId: string, stage: string) => {
    setLoading(true);
    try {
      await fetch(`/api/partners/${partnerId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, stage })
      });
      router.refresh();
      setIsAdding(false);
      setSelectedProductId('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      {currentProducts.length === 0 && !isAdding ? (
        <span style={{ fontSize: '0.875rem', color: 'var(--neutral-500)' }}>No services added</span>
      ) : (
        currentProducts.map(pp => (
          <div key={pp.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--neutral-100)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{pp.product.name}</span>
            <select 
              value={pp.stage}
              onChange={(e) => handleUpdate(pp.productId, e.target.value)}
              disabled={loading}
              style={{
                fontSize: '0.75rem',
                padding: '2px 4px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--neutral-200)',
                background: 'var(--white)'
              }}
            >
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))
      )}

      {isAdding ? (
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', background: 'var(--white)', padding: '8px', border: '1px solid var(--neutral-200)', borderRadius: 'var(--radius-md)' }}>
          <select 
            value={selectedProductId} 
            onChange={e => setSelectedProductId(e.target.value)}
            style={{ flex: 1, padding: '4px' }}
          >
            <option value="">Select Service...</option>
            {allProducts.filter(p => !currentProducts.find(cp => cp.productId === p.id)).map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select 
            value={selectedStage} 
            onChange={e => setSelectedStage(e.target.value)}
            style={{ width: '100px', padding: '4px' }}
          >
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button 
            onClick={() => handleUpdate(selectedProductId, selectedStage)}
            disabled={!selectedProductId || loading}
            style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', padding: '0 8px' }}
          >
            Add
          </button>
          <button 
            onClick={() => setIsAdding(false)}
            style={{ background: 'transparent', border: 'none', padding: '0 8px' }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button 
          onClick={() => setIsAdding(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: '1px dashed var(--neutral-200)', padding: '8px', borderRadius: 'var(--radius-md)', cursor: 'pointer', color: 'var(--neutral-500)', fontSize: '0.875rem', justifyContent: 'center', marginTop: '4px' }}
        >
          <Plus size={14} /> Add Service
        </button>
      )}
    </div>
  );
}
