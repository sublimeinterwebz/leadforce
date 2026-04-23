'use client';

import { Menu, UserCircle } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <button className={styles.iconBtn}>
        <Menu size={24} color="var(--primary)" />
      </button>
      <h1 className={styles.title}>CRM_OPERATIONS</h1>
      <button className={styles.iconBtn}>
        <UserCircle size={28} color="var(--neutral-800)" />
      </button>
    </header>
  );
}
