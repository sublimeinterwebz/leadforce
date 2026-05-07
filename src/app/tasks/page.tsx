import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import { CheckSquare, Square, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import TaskItemClient from '@/components/TaskItemClient';
import CreateTaskClient from '@/components/CreateTaskClient';

export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const tasks = await prisma.action.findMany({
    include: { partner: true },
    orderBy: { dueDate: 'asc' }
  });
  
  const partners = await prisma.partner.findMany({
    select: { id: true, companyName: true },
    orderBy: { companyName: 'asc' }
  });

  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const completedTasks = tasks.filter(t => t.status === 'Completed').slice(0, 5); // Just show recent 5

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className={styles.title}>ALL TASKS</h1>
          <div className={styles.subtitle}>{pendingTasks.length} Pending Actions</div>
        </div>
        <CreateTaskClient partners={partners} />
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>PENDING</h2>
        <div className={styles.card}>
          {pendingTasks.length === 0 ? (
            <p className={styles.empty}>No pending tasks. Great job!</p>
          ) : (
            <ul className={styles.taskList}>
              {pendingTasks.map(task => (
                <TaskItemClient key={task.id} task={task} />
              ))}
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
                <TaskItemClient key={task.id} task={task} />
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
