'use client';

import { LayoutDashboard, Users, ClipboardList, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navigation.module.css';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { name: 'DASHBOARD', href: '/', icon: LayoutDashboard },
    { name: 'PARTNERS', href: '/partners', icon: Users },
    { name: 'TASKS', href: '/tasks', icon: ClipboardList },
    { name: 'REPORTS', href: '/reports', icon: BarChart3 },
  ];

  return (
    <nav className={styles.navbar}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.name} 
            href={item.href} 
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
          >
            <Icon size={24} className={styles.icon} />
            <span className={styles.label}>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
