'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Upload, Trash2, Download } from 'lucide-react';

export default function DocumentManagerClient({ partnerId, documents }: { partnerId: string, documents: any[] }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('partnerId', partnerId);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Failed to upload document.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while uploading document.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--neutral-500)', letterSpacing: '1px' }}>DOCUMENTS</h2>
        <button
          onClick={handleUploadClick}
          disabled={uploading}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'transparent', border: '1px solid var(--neutral-300)',
            borderRadius: 'var(--radius-md)', padding: '6px 12px',
            fontSize: '0.75rem', fontWeight: 600, cursor: uploading ? 'not-allowed' : 'pointer',
            color: 'var(--neutral-700)', opacity: uploading ? 0.6 : 1,
          }}
        >
          <Upload size={14} /> {uploading ? 'UPLOADING...' : 'UPLOAD FILE'}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
        />
      </div>

      {documents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', background: 'var(--neutral-100)', borderRadius: 'var(--radius-md)', color: 'var(--neutral-500)', fontSize: '0.85rem' }}>
          No documents attached.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {documents.map(doc => (
            <div key={doc.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px', background: 'var(--white)', border: '1px solid var(--neutral-200)',
              borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'var(--neutral-100)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                  <FileText size={16} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--neutral-800)' }}>
                    {doc.fileName}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--neutral-500)' }}>
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <a 
                href={doc.fileUrl} 
                target="_blank" 
                rel="noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none'
                }}
              >
                <Download size={14} /> View
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
