import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import Link from 'next/link';
import { ArrowLeft, PhoneCall, CheckSquare, Square, FileText, Calendar, Send, Plus } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { notFound } from 'next/navigation';

export default async function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const partner = await prisma.partner.findUnique({
    where: { id: resolvedParams.id },
    include: {
      products: { include: { product: true } },
      actions: { orderBy: { dueDate: 'asc' } },
      history: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!partner) return notFound();

  const nextAction = partner.actions.find(a => a.status === 'Pending');

  return (
    <div className={styles.container}>
      <Link href="/partners" className={styles.backBtn}>
        <ArrowLeft size={16} /> Back
      </Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{partner.companyName}</h1>
          <div className={styles.subtitle}>ID: {partner.id.slice(0, 8).toUpperCase()}</div>
        </div>
        <div className={`${styles.pill} ${styles.pillActive}`}>
          {partner.overallStage}
        </div>
      </div>

      {nextAction && (
        <div className={styles.nextActionBanner}>
          <div className={styles.bannerLabel}>NEXT ACTION</div>
          <div className={styles.bannerContent}>
            <div className={styles.bannerTitle}>{nextAction.description}</div>
            <div className={styles.bannerTime}>
              {new Date(nextAction.dueDate) < new Date() ? 'OVERDUE' : format(new Date(nextAction.dueDate), 'MMM dd, p')}
            </div>
          </div>
        </div>
      )}

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>SERVICES</h2>
        <div className={styles.servicesList}>
          {partner.products.length === 0 ? (
            <span className={styles.emptyText}>No services added</span>
          ) : (
            partner.products.map(pp => (
              <span key={pp.productId} className={styles.serviceTag}>
                {pp.product.name.toUpperCase()}
              </span>
            ))
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>PENDING TASKS</h2>
          <button className={styles.logCallBtn}>
            <PhoneCall size={14} /> LOG CALL
          </button>
        </div>
        
        <div className={styles.taskList}>
          {partner.actions.filter(a => a.status === 'Pending').length === 0 ? (
            <div className={styles.emptyText}>All caught up!</div>
          ) : (
            partner.actions.filter(a => a.status === 'Pending').map(task => {
              const isOverdue = new Date(task.dueDate) < new Date();
              return (
                <div key={task.id} className={styles.taskCard}>
                  <div className={styles.taskLeft}>
                    <div className={`${styles.taskIndicator} ${isOverdue ? styles.indicatorDanger : styles.indicatorPrimary}`} />
                    <div>
                      <div className={styles.taskTitle}>
                        {isOverdue ? <strong className={styles.textDanger}>Overdue: </strong> : ''}
                        {task.description}
                      </div>
                      <div className={`${styles.taskTime} ${isOverdue ? styles.textDanger : ''}`}>
                        {isOverdue ? `Due ${formatDistanceToNow(new Date(task.dueDate))} ago` : `Due ${format(new Date(task.dueDate), 'MMM dd')}`}
                      </div>
                    </div>
                  </div>
                  <Square size={20} color="var(--neutral-500)" />
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>ACTIVITY TIMELINE</h2>
        <div className={styles.timeline}>
          {partner.history.length === 0 ? (
            <div className={styles.emptyText}>No activity recorded</div>
          ) : (
            partner.history.map(log => (
              <div key={log.id} className={styles.timelineItem}>
                <div className={styles.timelineIcon}>
                  {log.type === 'System' ? <Calendar size={14} /> : <FileText size={14} />}
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineHeader}>
                    <span className={styles.timelineType}>{log.type === 'System' ? 'System Event' : 'Internal Note'}</span>
                    <span className={styles.timelineTime}>{formatDistanceToNow(new Date(log.createdAt))} ago</span>
                  </div>
                  <div className={`${styles.timelineText} ${log.type !== 'System' ? styles.timelineNote : ''}`}>
                    {log.type !== 'System' && '"'}{log.content}{log.type !== 'System' && '"'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className={styles.quickLog}>
        <Plus size={20} color="var(--neutral-500)" />
        <input type="text" placeholder="Quick log / Add note..." className={styles.quickInput} />
        <button className={styles.quickSend}>
          <Send size={16} color="var(--white)" />
        </button>
      </div>

    </div>
  );
}
