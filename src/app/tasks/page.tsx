import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import { CheckSquare, Square, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const tasks = await prisma.action.findMany({
    include: { partner: true },
    orderBy: { dueDate: 'asc' }
  });

  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const completedTasks = tasks.filter(t => t.status === 'Completed').slice(0, 5); // Just show recent 5

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>ALL TASKS</h1>
        <div className={styles.subtitle}>{pendingTasks.length} Pending Actions</div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>PENDING</h2>
        <div className={styles.card}>
          {pendingTasks.length === 0 ? (
            <p className={styles.empty}>No pending tasks. Great job!</p>
          ) : (
            <ul className={styles.taskList}>
              {pendingTasks.map(task => {
                const isOverdue = new Date(task.dueDate) < new Date();
                return (
                  <li key={task.id} className={styles.taskItem}>
                    <Square size={20} color="var(--neutral-300)" className={styles.checkbox} />
                    <div className={styles.taskInfo}>
                      <div className={styles.taskTitle}>
                        {isOverdue && <AlertCircle size={14} color="var(--danger)" style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }}/>}
                        {task.description}
                      </div>
                      <div className={styles.taskMeta}>
                        <span className={isOverdue ? styles.textDanger : styles.textNeutral}>
                          {isOverdue ? `Overdue by ${formatDistanceToNow(task.dueDate)}` : `Due ${format(task.dueDate, 'MMM dd, p')}`}
                        </span>
                        <span> • {task.partner.companyName}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>RECENTLY COMPLETED</h2>
        <div className={styles.card}>
          {completedTasks.length === 0 ? (
            <p className={styles.empty}>No completed tasks yet.</p>
          ) : (
            <ul className={styles.taskList}>
              {completedTasks.map(task => (
                <li key={task.id} className={`${styles.taskItem} ${styles.taskDone}`}>
                  <CheckSquare size={20} color="var(--primary)" className={styles.checkbox} />
                  <div className={styles.taskInfo}>
                    <div className={styles.taskTitle}>{task.description}</div>
                    <div className={styles.taskMeta}>
                      Completed • {task.partner.companyName}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
