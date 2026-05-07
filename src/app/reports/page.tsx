import { prisma } from '@/lib/prisma';
import styles from './page.module.css';
import { Filter, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  // Fetch real counts for the funnel
  const discoveryCount = await prisma.partner.count({ where: { overallStage: 'Discovery' } });
  const scopeCount = await prisma.partner.count({ where: { overallStage: 'Scope Alignment' } });
  const commitCount = await prisma.partner.count({ where: { overallStage: 'Commitment' } });
  const contractCount = await prisma.partner.count({ where: { overallStage: 'Contracting' } });

  // Fetch real service distribution
  const products = await prisma.product.findMany({
    include: { _count: { select: { partners: true } } },
    orderBy: { partners: { _count: 'desc' } }
  });

  // Fetch real sector distribution
  const totalPartnersForSector = discoveryCount + scopeCount + commitCount + contractCount || 1; // avoid div by 0
  const industryDistribution = await prisma.partner.groupBy({
    by: ['industryCategory'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });

  // Calculate dynamic conversion rate
  const totalPartners = await prisma.partner.count();
  const deliveredPartners = await prisma.partner.count({ where: { overallStage: 'Delivery' } });
  const conversionRate = totalPartners === 0 ? 0 : ((deliveredPartners / totalPartners) * 100).toFixed(1);

  // Active Service Assignments
  const activeAssignments = await prisma.partnerProduct.count();

  // Weekly Engagement Chart Data
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday
  startOfWeek.setHours(0,0,0,0);

  const logsThisWeek = await prisma.historyLog.findMany({
    where: { createdAt: { gte: startOfWeek } },
    select: { createdAt: true }
  });

  const dayCounts = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun
  logsThisWeek.forEach(log => {
    let day = log.createdAt.getDay() - 1;
    if (day === -1) day = 6; // Sunday is 0 in JS, mapped to 6
    dayCounts[day]++;
  });

  const maxCount = Math.max(...dayCounts, 1);
  const dayHeights = dayCounts.map(count => Math.round((count / maxCount) * 100));

  // Stagnant Deals Alert
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const stagnantDeals = await prisma.partner.findMany({
    where: { 
      overallStage: { notIn: ['Delivery', 'Closed Lost', 'No Feedback'] },
      lastActivityAt: { lt: fourteenDaysAgo }
    },
    select: { companyName: true, overallStage: true }
  });

  return (
    <div className={styles.container}>
      
      <div className={styles.headerRow}>
        <div>
          <div className={styles.subtitle}>OPERATIONAL OVERVIEW</div>
          <h1 className={styles.title}>Reports</h1>
        </div>
        <button className={styles.filterBtn}>
          <Filter size={14} /> FILTER
        </button>
      </div>

      {/* Top Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>CONVERSION (DELIVERED)</div>
          <div className={styles.statValue}>{conversionRate}%</div>
          <div className={styles.trendUp}>{deliveredPartners} Total Delivered</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>ACTIVE ASSIGNMENTS</div>
          <div className={styles.statValue}>{activeAssignments}</div>
          <div className={styles.trendUp}>Across {totalPartners} Partners</div>
        </div>
      </div>

      {/* Pipeline Velocity (Funnel) */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>PIPELINE VELOCITY</h2>
          <span className={styles.timeframe}>{new Date().getFullYear()}</span>
        </div>
        <div className={styles.funnelContainer}>
          <div className={styles.funnelRow} style={{ width: '100%' }}>
            <span>DISCOVERY</span>
            <span>{discoveryCount} Leads</span>
          </div>
          <div className={styles.funnelRow} style={{ width: '85%' }}>
            <span>SCOPE ALIGNMENT</span>
            <span>{scopeCount} Leads</span>
          </div>
          <div className={styles.funnelRow} style={{ width: '70%' }}>
            <span>COMMITMENT</span>
            <span>{commitCount} Leads</span>
          </div>
          <div className={styles.funnelRow} style={{ width: '55%' }}>
            <span>CONTRACTING</span>
            <span>{contractCount} Leads</span>
          </div>
        </div>
      </section>

      {/* Weekly Engagement */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>WEEKLY ENGAGEMENT</h2>
        <div className={styles.barChart}>
          <div className={styles.barCol}><div className={styles.barFill} style={{ height: `${dayHeights[0]}%`, background: dayHeights[0] === 0 ? 'var(--neutral-200)' : 'var(--primary)' }} /><span>M</span></div>
          <div className={styles.barCol}><div className={styles.barFill} style={{ height: `${dayHeights[1]}%`, background: dayHeights[1] === 0 ? 'var(--neutral-200)' : 'var(--primary)' }} /><span>T</span></div>
          <div className={styles.barCol}><div className={styles.barFill} style={{ height: `${dayHeights[2]}%`, background: dayHeights[2] === 0 ? 'var(--neutral-200)' : 'var(--primary)' }} /><span>W</span></div>
          <div className={styles.barCol}><div className={styles.barFill} style={{ height: `${dayHeights[3]}%`, background: dayHeights[3] === 0 ? 'var(--neutral-200)' : 'var(--primary)' }} /><span>T</span></div>
          <div className={styles.barCol}><div className={styles.barFill} style={{ height: `${dayHeights[4]}%`, background: dayHeights[4] === 0 ? 'var(--neutral-200)' : 'var(--primary)' }} /><span>F</span></div>
          <div className={styles.barCol}><div className={styles.barFill} style={{ height: `${dayHeights[5]}%`, background: dayHeights[5] === 0 ? 'var(--neutral-200)' : 'var(--primary)' }} /><span>S</span></div>
          <div className={styles.barCol}><div className={styles.barFill} style={{ height: `${dayHeights[6]}%`, background: dayHeights[6] === 0 ? 'var(--neutral-200)' : 'var(--primary)' }} /><span>S</span></div>
        </div>
      </section>

      {/* Sector Distribution */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>SECTOR DISTRIBUTION</h2>
        <ul className={styles.distList}>
          {industryDistribution.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--neutral-500)', padding: 12 }}>No data available yet.</p>}
          {industryDistribution.map((sector, index) => {
            const colors = ['var(--primary)', 'var(--secondary)', 'var(--tertiary)', '#F59E0B', '#8B5CF6'];
            const color = colors[index % colors.length];
            // Just calculating percentage relative to active deals for UI purposes
            const total = industryDistribution.reduce((acc, curr) => acc + curr._count.id, 0);
            const percentage = Math.round((sector._count.id / total) * 100);
            
            return (
              <li key={sector.industryCategory || 'unknown'} className={styles.distItem}>
                <div className={styles.distLeft}>
                  <span className={styles.dot} style={{ background: color }} /> 
                  {sector.industryCategory || 'Other'}
                </div>
                <div className={styles.distRight}>{percentage}% ({sector._count.id})</div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Services Distribution */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>SERVICES DISTRIBUTION</h2>
        <ul className={styles.distList}>
          {products.map(p => (
            <li key={p.id} className={styles.distItem}>
              <div className={styles.distLeft}><span className={styles.dot} style={{ background: 'var(--primary)' }} /> {p.name}</div>
              <div className={styles.distRight}>{p._count.partners} Partners</div>
            </li>
          ))}
        </ul>
      </section>

      {/* Active Alerts */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>ACTIVE ALERTS</h2>
        {stagnantDeals.length === 0 ? (
          <div className={styles.alertCard} style={{ borderColor: 'var(--neutral-200)', background: 'var(--white)' }}>
            <div className={styles.alertBody} style={{ color: 'var(--neutral-600)' }}>
              No stagnant deals. Pipeline is healthy!
            </div>
          </div>
        ) : (
          <div className={styles.alertCard}>
            <div className={styles.alertHeader}>
              <AlertTriangle size={16} /> STAGNANT PIPELINE
            </div>
            <div className={styles.alertBody}>
              {stagnantDeals.length} active deals have had no activity for 14 days.<br/>
              <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block', marginTop: '6px' }}>
                {stagnantDeals.slice(0, 3).map(d => d.companyName).join(', ')} {stagnantDeals.length > 3 ? '...' : ''}
              </span>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
