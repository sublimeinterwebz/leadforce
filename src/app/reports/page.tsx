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
          <div className={styles.statLabel}>CONVERSION</div>
          <div className={styles.statValue}>24.8%</div>
          <div className={styles.trendUp}>↗ +2.1%</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>REVENUE (Est)</div>
          <div className={styles.statValue}>$1.2M</div>
          <div className={styles.trendDown}>↘ -0.4%</div>
        </div>
      </div>

      {/* Pipeline Velocity (Funnel) */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>PIPELINE VELOCITY</h2>
          <span className={styles.timeframe}>Q3 FY24</span>
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
          <div className={styles.barCol}><div className={styles.barFill} style={{ height: '60%' }} /><span>M</span></div>
          <div className={styles.barCol}><div className={styles.barFill} style={{ height: '100%' }} /><span>T</span></div>
          <div className={styles.barCol}><div className={styles.barFill} style={{ height: '80%' }} /><span>W</span></div>
          <div className={styles.barCol}><div className={styles.barFill} style={{ height: '40%' }} /><span>T</span></div>
          <div className={styles.barCol}><div className={styles.barFill} style={{ height: '50%' }} /><span>F</span></div>
          <div className={styles.barCol}><div className={styles.barFill} style={{ height: '10%', background: 'var(--neutral-200)' }} /><span>S</span></div>
          <div className={styles.barCol}><div className={styles.barFill} style={{ height: '10%', background: 'var(--neutral-200)' }} /><span>S</span></div>
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
        <div className={styles.alertCard}>
          <div className={styles.alertHeader}>
            <AlertTriangle size={16} /> STAGNANT PIPELINE
          </div>
          <div className={styles.alertBody}>
            3 high-value deals in 'Negotiation' have had no activity for 14 days.
          </div>
        </div>
      </section>

    </div>
  );
}
