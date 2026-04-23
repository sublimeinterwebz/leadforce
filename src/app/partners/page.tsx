import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import Link from 'next/link';
import { Plus, Edit2, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({
    include: {
      products: { include: { product: true } },
      actions: {
        where: { status: 'Pending' },
        orderBy: { dueDate: 'asc' },
        take: 1
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  const activeCount = await prisma.partner.count({
    where: { overallStage: { notIn: ['Delivery', 'Closed Lost'] } }
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>PARTNERS</h1>
          <div className={styles.subtitle}>{activeCount} Active Accounts</div>
        </div>
        <Link href="/partners/new" className={styles.newBtn}>
          <Plus size={16} /> NEW
        </Link>
      </div>

      <div className={styles.filters}>
        <button className={`${styles.filterChip} ${styles.activeChip}`}>ALL</button>
        <button className={styles.filterChip}>OVERDUE</button>
        <button className={styles.filterChip}>RETAIL</button>
        <button className={styles.filterChip}>TECH</button>
      </div>

      <div className={styles.listHeader}>
        <div>PARTNER / INDUSTRY</div>
        <div>STATUS</div>
        <div>ACTION DATE</div>
      </div>

      <div className={styles.list}>
        {partners.map(partner => {
          const nextAction = partner.actions[0];
          const isOverdue = nextAction && new Date(nextAction.dueDate) < new Date();
          
          return (
            <div key={partner.id} className={styles.partnerCard}>
              
              <div className={styles.cardTopRow}>
                <div className={styles.partnerInfo}>
                  <div className={styles.partnerName}>{partner.companyName}</div>
                  <div className={styles.partnerIndustry}>{partner.industryCategory || 'UNSPECIFIED'}</div>
                </div>
                
                <div className={`${styles.pill} ${partner.overallStage === 'Discovery' ? styles.pillDiscovery : styles.pillActive}`}>
                  {partner.overallStage}
                </div>
                
                <div className={styles.actionDate}>
                  {nextAction ? (
                    <>
                      <div className={styles.dateText}>{format(new Date(nextAction.dueDate), 'MMM dd').toUpperCase()}</div>
                      <div className={`${styles.dateStatus} ${isOverdue ? styles.textOverdue : ''}`}>
                        {isOverdue ? 'OVERDUE' : 'UPCOMING'}
                      </div>
                    </>
                  ) : (
                    <div className={styles.dateText}>--</div>
                  )}
                </div>
              </div>

              <div className={styles.cardActions}>
                <Link href={`/partners/${partner.id}`} className={styles.actionBtn}>
                  <Edit2 size={14} /> UPDATE
                </Link>
                <Link href={`/partners/${partner.id}?tab=notes`} className={styles.actionBtn}>
                  <FileText size={14} /> NOTE
                </Link>
              </div>

              {partner.products.length > 0 && (
                <div className={styles.servicesList}>
                  {partner.products.map(pp => (
                    <span key={pp.productId} className={styles.serviceTag}>
                      {pp.product.name.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
              
            </div>
          );
        })}
      </div>
    </div>
  );
}
