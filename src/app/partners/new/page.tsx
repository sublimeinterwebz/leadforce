'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function NewPartnerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    industryCategory: '',
    keyContact: '',
    contactEmail: '',
    contactPhone: '',
    source: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const partner = await res.json();
        router.push(`/partners/${partner.id}`);
        router.refresh(); // Refresh the server components to show the new partner
      } else {
        alert('Failed to create partner');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating partner');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backBtn}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className={styles.header}>
        <h1 className={styles.title}>New Partner</h1>
        <p className={styles.subtitle}>Enter the lead's details to add them to the pipeline.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Company Details</h2>
          
          <div className={styles.inputGroup}>
            <label>Company Name *</label>
            <input required type="text" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g. Global Logistics Corp" />
          </div>

          <div className={styles.inputGroup}>
            <label>Industry Category</label>
            <select name="industryCategory" value={formData.industryCategory} onChange={handleChange}>
              <option value="">Select an industry...</option>
              <option value="Retail">Retail</option>
              <option value="FinTech">FinTech</option>
              <option value="Healthcare">Healthcare</option>
              <option value="SaaS / Enterprise">SaaS / Enterprise</option>
              <option value="Automotive">Automotive</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className={styles.inputGroup}>
            <label>Lead Source</label>
            <input type="text" name="source" value={formData.source} onChange={handleChange} placeholder="e.g. Outbound, Referral, Website" />
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Contact Person</h2>
          
          <div className={styles.inputGroup}>
            <label>Full Name</label>
            <input type="text" name="keyContact" value={formData.keyContact} onChange={handleChange} placeholder="e.g. Sarah J." />
          </div>

          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} placeholder="sarah@example.com" />
          </div>

          <div className={styles.inputGroup}>
            <label>Phone Number</label>
            <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} placeholder="+20 100 000 0000" />
          </div>
        </div>

        <button type="submit" disabled={loading} className={styles.submitBtn}>
          {loading ? 'Creating...' : <><Save size={18} /> CREATE PARTNER</>}
        </button>

      </form>
    </div>
  );
}
