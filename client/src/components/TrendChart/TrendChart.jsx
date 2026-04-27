import { CartesianGrid, LabelList, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import styles from './TrendChart.module.css';

const METRIC_CONFIG = {
  nps: { label: 'NPS', colour: 'var(--violet)', domain: [-100, 100], format: (v) => (v > 0 ? `+${v}` : v) },
  csat: { label: 'CSAT', colour: 'var(--positive)', domain: [0, 100], format: (v) => `${v}%` },
  ces: { label: 'CES', colour: 'var(--neutral)', domain: [1, 7], format: (v) => Number(v).toFixed(1) },
  volume: { label: 'Responses', colour: 'var(--blue)', domain: ['auto', 'auto'], format: (v) => v },
  sentiment: { label: 'Negative', colour: 'var(--negative)', domain: [0, 100], format: (v) => `${v}%` }
};

function CustomTooltip({ active, payload, label, metric }) {
  if (!active || !payload?.length) return null;
  const cfg = METRIC_CONFIG[metric] || METRIC_CONFIG.nps;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipPeriod}>{label}</p>
      <p className={styles.tooltipValue} style={{ color: cfg.colour }}>
        {cfg.label}: <strong>{cfg.format(payload[0].value)}</strong>
      </p>
      {payload[0].payload.total && <p className={styles.tooltipSub}>{payload[0].payload.total} responses</p>}
    </div>
  );
}

export default function TrendChart({ data, annotations = [], metric = 'nps', compact = false }) {
  const cfg = METRIC_CONFIG[metric] || METRIC_CONFIG.nps;

  return (
    <div className={`${styles.wrap} ${compact ? styles.compact : ''}`}>
      <ResponsiveContainer width="100%" height={compact ? 170 : 310}>
        <LineChart data={data} margin={{ top: 18, right: 18, left: 0, bottom: 6 }}>
          {!compact && <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />}
          <XAxis dataKey="period" tick={{ fontSize: 11, fontFamily: 'Nunito', fill: '#9CA3AF' }} axisLine={false} tickLine={false} minTickGap={20} />
          <YAxis domain={cfg.domain} tick={{ fontSize: 11, fontFamily: 'Nunito', fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={42} tickFormatter={cfg.format} />
          <Tooltip content={<CustomTooltip metric={metric} />} />
          {metric === 'nps' && <ReferenceLine y={0} stroke="#D1D5DB" strokeDasharray="4 2" />}
          {annotations.map((annotation) => (
            <ReferenceLine
              key={annotation.id}
              x={annotation.period || annotation.date}
              stroke="#9CA3AF"
              strokeDasharray="3 3"
              label={{ value: annotation.label, position: 'top', fontSize: 10, fill: '#6B7280' }}
            />
          ))}
          <Line type="monotone" dataKey="value" stroke={cfg.colour} strokeWidth={2.5} dot={{ r: 3, fill: cfg.colour, strokeWidth: 0 }} activeDot={{ r: 5, fill: cfg.colour }}>
            {compact && data?.length > 0 && <LabelList dataKey="value" position="top" formatter={cfg.format} style={{ fill: cfg.colour, fontFamily: 'Nunito', fontSize: 10 }} />}
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
