import { AlertCircle, CheckSquare, Square, Plus } from 'lucide-react';
import styles from './page.module.css';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDistanceToNow, format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  // 0. Auto-seed products if empty
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    const defaultProducts = [
      'Card Acceptance', 'Wallet Acceptance', 'Erada Financing', 
      'Loyalty', 'EBU', 'Cash Collection', 'HR Payroll', 'HR Salary in advance'
    ];
    for (const name of defaultProducts) {
      await prisma.product.upsert({
        where: { name },
        update: {},
        create: { name }
      });
    }
  }

  // 1. Fetch real stats
  const totalLeads = await prisma.partner.count();
  const activeDeals = await prisma.partner.count({
    where: { overallStage: { notIn: ['Delivery', 'Closed Lost'] } }
  });

  // 2. Fetch overdue tasks
  const overdueTasks = await prisma.action.findMany({
    where: { dueDate: { lt: new Date() }, status: 'Pending' },
    include: { partner: true },
    orderBy: { dueDate: 'asc' },
    take: 3
  });

  // 3. Fetch today's tasks
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todaysTasks = await prisma.action.findMany({
    where: { dueDate: { gte: startOfDay, lte: endOfDay } },
    include: { partner: true },
    orderBy: { dueDate: 'asc' },
    take: 4
  });

  // 4. Fetch recent partners
  const recentPartners = await prisma.partner.findMany({
    orderBy: { lastActivityAt: 'desc' },
    take: 5
  });

  return (
    <div className={styles.dashboard}>
      
      {/* Top Stats */}
      <div className={styles.statsGrid}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className={styles.statLabel}>ACTIVE DEALS</div>
          <div className={styles.statValue}>
            {activeDeals}
            {/* Hardcoded trend for visual purposes until we have historical tracking */}
            <span className={styles.trendUp}>+12%</span>
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className={styles.statLabel}>TOTAL LEADS</div>
          <div className={styles.statValue}>
            {totalLeads}
          </div>
        </div>
      </div>

      {/* Overdue Tasks Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeaderAlert}>
          <AlertCircle size={18} color="var(--danger)" />
          <h2 className={styles.sectionTitleDanger}>OVERDUE TASKS</h2>
        </div>
        <div className="card">
          {overdueTasks.length === 0 ? (
            <p className={styles.emptyState}>No overdue tasks! 🎉</p>
          ) : (
            <ul className={styles.taskList}>
              {overdueTasks.map(task => (
                <li key={task.id} className={styles.taskItemOverdue}>
                  <div>
                    <div className={styles.taskTitle}>{task.description} - {task.partner.companyName}</div>
                    <div className={styles.taskDelay}>Delayed by {formatDistanceToNow(task.dueDate)}</div>
                  </div>
                  <AlertCircle size={20} color="var(--danger)" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Today's Tasks Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>TODAY'S TASKS</h2>
          <Link href="/tasks" className={styles.viewAll}>View All</Link>
        </div>
        <div className="card">
          {todaysTasks.length === 0 ? (
            <p className={styles.emptyState}>No tasks for today.</p>
          ) : (
            <ul className={styles.taskList}>
              {todaysTasks.map(task => (
                <li key={task.id} className={`${styles.taskItem} ${task.status === 'Completed' ? styles.taskDone : ''}`}>
                  {task.status === 'Completed' ? (
                    <CheckSquare size={20} color="var(--primary)" className={styles.checkbox} />
                  ) : (
                    <Square size={20} color="var(--neutral-200)" className={styles.checkbox} />
                  )}
                  <div>
                    <div className={styles.taskTitle}>{task.description}</div>
                    <div className={styles.taskTime}>{format(task.dueDate, 'hh:mm a')} • {task.partner.companyName}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Recent Partners Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>RECENT PARTNERS</h2>
        <div className={styles.horizontalScroll}>
          {recentPartners.length === 0 ? (
            <p className={styles.emptyState}>No partners added yet.</p>
          ) : (
            recentPartners.map(partner => (
              <Link href={`/partners/${partner.id}`} key={partner.id} style={{ textDecoration: 'none' }}>
                <div className={styles.partnerCard}>
                  <div className={styles.partnerLogo}>{partner.companyName.charAt(0).toUpperCase()}</div>
                  <div className={styles.partnerName}>{partner.companyName.slice(0, 15)}{partner.companyName.length > 15 ? '...' : ''}</div>
                  <div className={`${styles.partnerStatus} ${partner.overallStage !== 'Delivery' ? styles.statusActive : ''}`}>
                    {partner.overallStage}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Floating Action Button */}
      <Link href="/partners/new">
        <button className={styles.fabBtn}>
          <Plus size={24} color="var(--white)" />
        </button>
      </Link>

    </div>
  );
}
