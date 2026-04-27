import { useEffect, useRef } from 'react';
import { formatNPS, npsLabel } from '../../utils/formatters';
import { npsColour } from '../../utils/colours';
import styles from './NPSGauge.module.css';

export default function NPSGauge({ score, promoterPct, detractorPct, total }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || score === null || score === undefined) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cssWidth = 240;
    const cssHeight = 140;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    ctx.setTransform?.(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    const cx = cssWidth / 2;
    const cy = cssHeight * 0.72;
    const r = cssWidth * 0.38;
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI);
    ctx.strokeStyle = '#EBEBEB';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.stroke();

    const progress = Math.max(0, Math.min(1, (score + 100) / 200));
    const grad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    grad.addColorStop(0, '#E11D48');
    grad.addColorStop(0.45, '#D97706');
    grad.addColorStop(1, '#059669');

    ctx.beginPath();
    ctx.arc(cx, cy, r, Math.PI, Math.PI + progress * Math.PI);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.stroke();

    const dotAngle = Math.PI + progress * Math.PI;
    const dx = cx + r * Math.cos(dotAngle);
    const dy = cy + r * Math.sin(dotAngle);
    ctx.beginPath();
    ctx.arc(dx, dy, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = score >= 30 ? '#059669' : score >= 0 ? '#D97706' : '#E11D48';
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [score]);

  const label = npsLabel(score) || 'No data';
  const passivePct = promoterPct !== null && promoterPct !== undefined && detractorPct !== null && detractorPct !== undefined ? 100 - promoterPct - detractorPct : null;

  return (
    <div className={styles.card}>
      <span className={styles.label}>Net Promoter Score</span>
      <div className={styles.gaugeWrap}>
        <canvas ref={canvasRef} className={styles.canvas} width={240} height={140} role="img" aria-label={`NPS score: ${score ?? 'not available'}`} />
        <div className={styles.scoreOverlay}>
          <span className={`${styles.score} metric-number count-in`} style={{ color: npsColour(score) }}>
            {formatNPS(score)}
          </span>
          <span className={styles.scoreLabel} style={{ color: npsColour(score) }}>
            {label}
          </span>
        </div>
      </div>
      <div className={styles.breakdown}>
        <div className={styles.bItem}>
          <span className={styles.bDot} style={{ background: 'var(--positive)' }} />
          <span>Promoters</span>
          <strong>{promoterPct ?? '—'}%</strong>
        </div>
        <div className={styles.bItem}>
          <span className={styles.bDot} style={{ background: 'var(--neutral)' }} />
          <span>Passives</span>
          <strong>{passivePct ?? '—'}%</strong>
        </div>
        <div className={styles.bItem}>
          <span className={styles.bDot} style={{ background: 'var(--negative)' }} />
          <span>Detractors</span>
          <strong>{detractorPct ?? '—'}%</strong>
        </div>
      </div>
      {total !== null && total !== undefined && <p className={styles.totalLabel}>{total.toLocaleString('en-AU')} responses</p>}
    </div>
  );
}
