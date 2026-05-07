'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export default function GlobalSearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');

  // Keep internal state in sync with URL if it changes externally
  useEffect(() => {
    setQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/partners?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/partners');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
      <Search 
        size={16} 
        color="var(--neutral-500)" 
        style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} 
      />
      <input
        type="text"
        placeholder="Search partners..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: '100%',
          padding: '8px 12px 8px 36px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--neutral-300)',
          background: 'var(--neutral-100)',
          fontSize: '0.85rem',
          outline: 'none',
        }}
        onFocus={(e) => e.target.style.background = 'var(--white)'}
        onBlur={(e) => e.target.style.background = 'var(--neutral-100)'}
      />
    </form>
  );
}
