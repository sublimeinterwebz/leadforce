'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X, Calendar as CalendarIcon } from 'lucide-react';

type PartnerOpt = { id: string, companyName: string };

export default function CreateTaskClient({ 
  partnerId, 
  partners 
}: { 
  partnerId?: string; 
  partners?: PartnerOpt[] 
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(partnerId || (partners?.[0]?.id || ''));

  const handleSave = async () => {
    if (!description || !dueDate || !selectedPartner) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: selectedPartner,
          description,
          dueDate: new Date(dueDate).toISOString()
        }),
      });
      if (res.ok) {
        setIsOpen(false);
        setDescription('');
        setDueDate('');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'var(--primary)', color: 'var(--white)',
          border: 'none', borderRadius: 'var(--radius-md)', padding: '10px 16px',
          fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
        }}
      >
        <Plus size={16} /> Add Task
      </button>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    border: '1px solid var(--neutral-200)', borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem', background: 'var(--white)',
    outline: 'none', marginBottom: '12px'
  };

  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--neutral-200)',
      borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>New Task</h3>
        <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <X size={18} color="var(--neutral-500)" />
        </button>
      </div>

      {!partnerId && partners && (
        <select 
          value={selectedPartner} 
          onChange={e => setSelectedPartner(e.target.value)}
          style={{...inputStyle, cursor: 'pointer'}}
        >
          {partners.map(p => (
            <option key={p.id} value={p.id}>{p.companyName}</option>
          ))}
        </select>
      )}

      <input 
        style={inputStyle} 
        placeholder="Task description (e.g., Send follow-up email)" 
        value={description} 
        onChange={e => setDescription(e.target.value)} 
      />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <CalendarIcon size={16} color="var(--neutral-500)" />
        <input 
          type="datetime-local" 
          style={{ ...inputStyle, marginBottom: 0 }} 
          value={dueDate} 
          onChange={e => setDueDate(e.target.value)} 
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !description || !dueDate || !selectedPartner}
        style={{
          width: '100%', padding: '10px',
          background: 'var(--primary)', color: 'var(--white)',
          border: 'none', borderRadius: 'var(--radius-md)',
          fontSize: '0.85rem', fontWeight: 700, cursor: (saving || !description || !dueDate) ? 'not-allowed' : 'pointer',
          opacity: (saving || !description || !dueDate) ? 0.6 : 1,
        }}
      >
        {saving ? 'SAVING...' : 'SAVE TASK'}
      </button>
    </div>
  );
}
