'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, AlertCircle } from 'lucide-react';
import styles from '../new/page.module.css';

export default function ImportPartnersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        // Map excel columns to expected schema loosely
        const mappedData = data.map((row: any) => ({
          companyName: row['Company Name'] || row['companyName'] || row['Company'] || row['Client'],
          keyContact: row['Contact Name'] || row['Key Contact'] || row['Name'],
          contactEmail: row['Email'] || row['contactEmail'],
          contactPhone: row['Phone'] || row['contactPhone'],
          source: row['Source'] || row['Lead Source'],
          industryCategory: row['Industry'] || row['Sector'],
          overallStage: row['Stage'] || row['Status'] || 'Discovery'
        })).filter(r => r.companyName); // Must have a company name

        setPreviewData(mappedData);
        setError('');
      } catch (err) {
        console.error(err);
        setError('Failed to parse Excel file. Ensure it is a valid .xlsx or .csv format.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (previewData.length === 0) return;
    setLoading(true);

    try {
      const res = await fetch('/api/partners/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partners: previewData })
      });

      if (res.ok) {
        alert('Import successful!');
        router.push('/partners');
        router.refresh();
      } else {
        const errData = await res.json();
        setError(errData.error || 'Import failed');
      }
    } catch (err) {
      console.error(err);
      setError('A network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Link href="/partners" className={styles.backBtn}>
        <ArrowLeft size={16} /> Back to Partners
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>Bulk Import</h1>
        <p className={styles.subtitle}>Upload an Excel file (.xlsx) or CSV to instantly populate your pipeline.</p>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className={styles.card} style={{ textAlign: 'center', padding: '32px' }}>
        <UploadCloud size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
        <h3 style={{ marginBottom: '8px' }}>Select File</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--neutral-500)', marginBottom: '16px' }}>
          Expected column headers: Company Name, Contact Name, Email, Phone, Industry, Stage
        </p>
        <input 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          onChange={handleFileUpload} 
          disabled={loading}
          style={{ width: '100%', maxWidth: '250px', margin: '0 auto' }}
        />
      </div>

      {previewData.length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Preview ({previewData.length} valid rows)</h2>
          <div style={{ overflowX: 'auto', maxHeight: '300px', marginBottom: '16px' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ background: 'var(--neutral-100)' }}>
                  <th style={{ padding: '8px' }}>Company</th>
                  <th style={{ padding: '8px' }}>Contact</th>
                  <th style={{ padding: '8px' }}>Stage</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 5).map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                    <td style={{ padding: '8px', fontWeight: 600 }}>{r.companyName}</td>
                    <td style={{ padding: '8px' }}>{r.keyContact || '-'}</td>
                    <td style={{ padding: '8px' }}>{r.overallStage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 5 && (
              <div style={{ textAlign: 'center', padding: '8px', color: 'var(--neutral-500)', fontSize: '0.75rem' }}>
                ... and {previewData.length - 5} more rows
              </div>
            )}
          </div>
          <button 
            onClick={handleImport} 
            disabled={loading} 
            className={styles.submitBtn}
          >
            {loading ? 'IMPORTING...' : `CONFIRM IMPORT (${previewData.length})`}
          </button>
        </div>
      )}
    </div>
  );
}
