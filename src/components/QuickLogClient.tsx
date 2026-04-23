'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Send } from 'lucide-react';

export default function QuickLogClient({ partnerId }: { partnerId: string }) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId,
          type: 'Note',
          content: content.trim()
        })
      });

      if (res.ok) {
        setContent('');
        router.refresh(); // Refresh the page to show the new note in the timeline
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      style={{
        position: 'sticky',
        bottom: 0,
        background: 'var(--white)',
        padding: '12px',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--neutral-200)',
        marginTop: 'auto',
        zIndex: 10
      }}
    >
      <Plus size={20} color="var(--neutral-500)" />
      <input 
        type="text" 
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Quick log / Add note..." 
        disabled={loading}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          fontSize: '0.875rem',
          fontFamily: 'var(--font-inter)',
          background: 'transparent'
        }}
      />
      <button 
        type="submit"
        disabled={loading || !content.trim()}
        style={{
          background: 'var(--primary)',
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: content.trim() && !loading ? 'pointer' : 'not-allowed',
          opacity: content.trim() && !loading ? 1 : 0.6
        }}
      >
        <Send size={16} color="var(--white)" />
      </button>
    </form>
  );
}
