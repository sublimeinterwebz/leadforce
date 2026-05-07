'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Square, CheckSquare, Trash2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import styles from '../app/partners/[id]/page.module.css';
import { Action, Partner } from '@prisma/client';

export default function TaskItemClient({ task }: { task: Action & { partner?: Partner } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isOverdue = new Date(task.dueDate) < new Date();

  const toggleStatus = async () => {
    if (loading) return;
    setLoading(true);
    const newStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await fetch(`/api/actions/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async () => {
    if (loading) return;
    if (!confirm('Delete this task?')) return;
    setLoading(true);
    try {
      await fetch(`/api/actions/${task.id}`, { method: 'DELETE' });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.taskCard} style={{ opacity: loading ? 0.5 : 1 }}>
      <div className={styles.taskLeft}>
        <div className={`${styles.taskIndicator} ${isOverdue && task.status === 'Pending' ? styles.indicatorDanger : styles.indicatorPrimary}`} />
        <div>
          <div className={styles.taskTitle} style={{ textDecoration: task.status === 'Completed' ? 'line-through' : 'none' }}>
            {isOverdue && task.status === 'Pending' ? <strong className={styles.textDanger}>Overdue: </strong> : ''}
            {task.description}
          </div>
          <div className={`${styles.taskTime} ${isOverdue && task.status === 'Pending' ? styles.textDanger : ''}`}>
            {isOverdue && task.status === 'Pending' ? `Due ${formatDistanceToNow(new Date(task.dueDate))} ago` : `Due ${format(new Date(task.dueDate), 'MMM dd')}`}
            {task.partner && ` • ${task.partner.companyName}`}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <button onClick={deleteTask} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 0 }}>
          <Trash2 size={16} />
        </button>
        <button onClick={toggleStatus} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
          {task.status === 'Completed' ? <CheckSquare size={20} color="var(--primary)" /> : <Square size={20} color="var(--neutral-500)" />}
        </button>
      </div>
    </div>
  );
}
