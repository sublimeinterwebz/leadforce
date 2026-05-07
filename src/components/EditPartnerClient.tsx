'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, X, Save } from 'lucide-react';
import { Partner } from '@prisma/client';

const STAGES = ['Discovery', 'Scope Alignment', 'Commitment', 'Contracting', 'Delivery', 'No Feedback'];

export default function EditPartnerClient({ partner }: { partner: Partner }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    companyName: partner.companyName || '',
    keyContact: partner.keyContact || '',
    contactEmail: partner.contactEmail || '',
    contactPhone: partner.contactPhone || '',
    source: partner.source || '',
    industryCategory: partner.industryCategory || '',
    overallStage: partner.overallStage || 'Discovery',
  });

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/partners/${partner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setEditing(false);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      companyName: partner.companyName || '',
      keyContact: partner.keyContact || '',
      contactEmail: partner.contactEmail || '',
      contactPhone: partner.contactPhone || '',
      source: partner.source || '',
      industryCategory: partner.industryCategory || '',
      overallStage: partner.overallStage || 'Discovery',
    });
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'var(--neutral-100)', border: '1px solid var(--neutral-200)',
          borderRadius: 'var(--radius-md)', padding: '8px 16px',
          fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          color: 'var(--neutral-800)', marginBottom: '16px', width: '100%',
          justifyContent: 'center',
        }}
      >
        <Pencil size={14} /> Edit Partner Details
      </button>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    border: '1px solid var(--neutral-200)', borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem', background: 'var(--white)',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.7rem', fontWeight: 700, color: 'var(--neutral-500)',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px',
    display: 'block',
  };

  return (
    <div style={{
      background: 'var(--white)', border: '2px solid var(--primary)',
      borderRadius: 'var(--radius-lg)', padding: '20px', marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)' }}>Editing Partner</h3>
        <button onClick={handleCancel} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <X size={18} color="var(--neutral-500)" />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={labelStyle}>Company Name</label>
          <input style={inputStyle} value={form.companyName} onChange={e => handleChange('companyName', e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Key Contact</label>
            <input style={inputStyle} value={form.keyContact} onChange={e => handleChange('keyContact', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} value={form.contactPhone} onChange={e => handleChange('contactPhone', e.target.value)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} type="email" value={form.contactEmail} onChange={e => handleChange('contactEmail', e.target.value)} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Source</label>
            <input style={inputStyle} value={form.source} onChange={e => handleChange('source', e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Industry</label>
            <input style={inputStyle} value={form.industryCategory} onChange={e => handleChange('industryCategory', e.target.value)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Overall Stage</label>
          <select
            value={form.overallStage}
            onChange={e => handleChange('overallStage', e.target.value)}
            style={{ ...inputStyle, cursor: 'pointer' }}
          >
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !form.companyName}
        style={{
          width: '100%', marginTop: '20px', padding: '12px',
          background: 'var(--primary)', color: 'var(--white)',
          border: 'none', borderRadius: 'var(--radius-md)',
          fontSize: '0.9rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.6 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}
      >
        <Save size={16} /> {saving ? 'SAVING...' : 'SAVE CHANGES'}
      </button>
    </div>
  );
}
