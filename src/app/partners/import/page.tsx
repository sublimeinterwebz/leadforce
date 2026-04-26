'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, AlertCircle, CheckCircle } from 'lucide-react';
import styles from '../new/page.module.css';

// Fuzzy column finder: case-insensitive, trims whitespace, matches partial names
function findCol(row: any, ...candidates: string[]): string | undefined {
  const keys = Object.keys(row);
  for (const candidate of candidates) {
    const match = keys.find(k => k.trim().toLowerCase().includes(candidate.toLowerCase()));
    if (match && row[match] !== undefined && row[match] !== null && String(row[match]).trim() !== '') {
      return String(row[match]).trim();
    }
  }
  return undefined;
}

// The 8 known services — used to detect service columns in the Excel
const KNOWN_SERVICES = [
  'Card Acceptance', 'Wallet Acceptance', 'Erada Financing',
  'Loyalty', 'EBU', 'Cash Collection', 'HR Payroll', 'HR Salary in advance'
];

// Find if a column header matches a known service (fuzzy, case-insensitive)
function findServiceColumns(headers: string[]): { header: string; serviceName: string }[] {
  const matches: { header: string; serviceName: string }[] = [];
  for (const header of headers) {
    const h = header.trim().toLowerCase();
    for (const service of KNOWN_SERVICES) {
      if (h.includes(service.toLowerCase()) || service.toLowerCase().includes(h)) {
        matches.push({ header, serviceName: service });
        break;
      }
    }
  }
  return matches;
}

export default function ImportPartnersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRowCount, setRawRowCount] = useState(0);
  const [detectedServices, setDetectedServices] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [fileSelected, setFileSelected] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileSelected(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws);
        
        if (data.length === 0) {
          setError('The file appears to be empty or has no recognizable data rows.');
          return;
        }

        const headers = Object.keys(data[0]);
        setRawHeaders(headers);
        setRawRowCount(data.length);

        // Detect service columns
        const serviceMatches = findServiceColumns(headers);
        setDetectedServices(serviceMatches.map(m => m.serviceName));

        // Fuzzy map excel columns to our schema
        const mappedData = data.map((row: any) => {
          // Extract services: for each matched service column, read the cell value as the stage
          const services: { serviceName: string; stage: string }[] = [];
          for (const { header, serviceName } of serviceMatches) {
            const cellValue = row[header];
            if (cellValue !== undefined && cellValue !== null && String(cellValue).trim() !== '') {
              services.push({ serviceName, stage: String(cellValue).trim() });
            }
          }

          return {
            companyName: findCol(row, 'company', 'client', 'partner', 'name', 'organization', 'org'),
            keyContact: findCol(row, 'contact', 'key contact', 'person', 'representative') || 'Unknown',
            contactEmail: findCol(row, 'email', 'e-mail', 'mail'),
            contactPhone: findCol(row, 'phone', 'mobile', 'tel', 'number'),
            source: findCol(row, 'source', 'lead source', 'channel', 'origin'),
            industryCategory: findCol(row, 'industry', 'sector', 'category', 'vertical'),
            overallStage: findCol(row, 'stage', 'status', 'pipeline', 'phase') || 'Discovery',
            services
          };
        }).filter(r => r.companyName);

        setPreviewData(mappedData);

        if (mappedData.length === 0) {
          setError(`Found ${data.length} rows but could not detect a "Company Name" column. Your file has these headers: ${Object.keys(data[0]).join(', ')}. Please rename one column to "Company Name" or "Company".`);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to parse file. Ensure it is a valid .xlsx or .csv format.');
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
        const result = await res.json();
        alert(`Successfully imported ${result.count} partners!`);
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
        <p className={styles.subtitle}>Upload an Excel (.xlsx) or CSV file to instantly populate your pipeline.</p>
      </div>

      {error && (
        <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.875rem', lineHeight: 1.5 }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> <span>{error}</span>
        </div>
      )}

      <div className={styles.card} style={{ textAlign: 'center', padding: '32px' }}>
        <UploadCloud size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
        <h3 style={{ marginBottom: '8px' }}>Select File</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--neutral-500)', marginBottom: '16px' }}>
          We auto-detect columns like: Company, Contact, Email, Phone, Industry, Stage, and your 8 service columns
        </p>
        <input 
          type="file" 
          accept=".xlsx, .xls, .csv" 
          onChange={handleFileUpload} 
          disabled={loading}
          style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}
        />
      </div>

      {/* Show detected headers for transparency */}
      {fileSelected && rawHeaders.length > 0 && (
        <div className={styles.card} style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Detected Columns ({rawRowCount} rows)</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {rawHeaders.map((h, i) => (
              <span key={i} style={{ background: 'var(--neutral-100)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>
                {h}
              </span>
            ))}
          </div>
          {detectedServices.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: 600, marginBottom: '6px' }}>✓ Service columns detected:</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {detectedServices.map((s, i) => (
                  <span key={i} style={{ background: 'var(--secondary-light)', color: 'var(--secondary)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview & Import */}
      {previewData.length > 0 && (
        <div className={styles.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircle size={18} color="var(--secondary)" />
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Preview ({previewData.length} partners ready)</h2>
          </div>
          <div style={{ overflowX: 'auto', maxHeight: '350px', marginBottom: '16px' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: 'var(--neutral-100)', position: 'sticky', top: 0 }}>
                  <th style={{ padding: '8px 12px' }}>Company</th>
                  <th style={{ padding: '8px 12px' }}>Contact</th>
                  <th style={{ padding: '8px 12px' }}>Stage</th>
                  <th style={{ padding: '8px 12px' }}>Services</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 10).map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>{r.companyName}</td>
                    <td style={{ padding: '8px 12px' }}>{r.keyContact || '-'}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                        {r.overallStage}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {r.services && r.services.length > 0 ? r.services.map((s: any, j: number) => (
                          <span key={j} style={{ background: 'var(--secondary-light)', color: 'var(--secondary)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 600 }}>
                            {s.serviceName}: {s.stage}
                          </span>
                        )) : <span style={{ color: 'var(--neutral-500)', fontSize: '0.75rem' }}>-</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 10 && (
              <div style={{ textAlign: 'center', padding: '8px', color: 'var(--neutral-500)', fontSize: '0.75rem' }}>
                ... and {previewData.length - 10} more rows
              </div>
            )}
          </div>
          <button 
            onClick={handleImport} 
            disabled={loading} 
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--primary)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.95rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              letterSpacing: '0.5px'
            }}
          >
            {loading ? 'IMPORTING...' : `CONFIRM IMPORT (${previewData.length} PARTNERS)`}
          </button>
        </div>
      )}
    </div>
  );
}
