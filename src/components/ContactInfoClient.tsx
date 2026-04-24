'use client';

import { useState } from 'react';
import { Phone, Mail, User, ChevronDown, ChevronUp } from 'lucide-react';
import styles from '../app/partners/[id]/page.module.css';

export default function ContactInfoClient({ partner }: { partner: any }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--neutral-200)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: '24px' }}>
      <div 
        onClick={() => setOpen(!open)} 
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
      >
        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--neutral-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={16} color="var(--primary)" /> Contact Details
        </h3>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
      
      {open && (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={14} color="var(--neutral-500)" />
            <strong>{partner.keyContact || 'No Name Provided'}</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={14} color="var(--neutral-500)" />
            {partner.contactEmail ? <a href={`mailto:${partner.contactEmail}`}>{partner.contactEmail}</a> : <span style={{ color: 'var(--neutral-500)' }}>No Email</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Phone size={14} color="var(--neutral-500)" />
            {partner.contactPhone ? <a href={`tel:${partner.contactPhone}`}>{partner.contactPhone}</a> : <span style={{ color: 'var(--neutral-500)' }}>No Phone</span>}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', marginTop: '8px' }}>
            Source: {partner.source || 'N/A'} • Industry: {partner.industryCategory || 'N/A'}
          </div>
        </div>
      )}
    </div>
  );
}
