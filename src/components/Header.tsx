'use client';

import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title} style={{ margin: '0 auto', color: 'var(--primary)', fontWeight: 800 }}>LEADFORCE</h1>
    </header>
  );
}
