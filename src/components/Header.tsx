'use client';

import styles from './Header.module.css';
import GlobalSearchClient from './GlobalSearchClient';
import Link from 'next/link';

export default function Header() {
  return (
    <header className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
      <Link href="/" style={{ textDecoration: 'none' }}>
        <h1 className={styles.title} style={{ margin: 0, color: 'var(--primary)', fontWeight: 800 }}>LEADFORCE</h1>
      </Link>
      <GlobalSearchClient />
    </header>
  );
}
