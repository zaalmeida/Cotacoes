
// Formatação e utilitários
export const fmt = (n, d=4) => (typeof n === 'number' && isFinite(n)) 
  ? n.toLocaleString('en-US', {minimumFractionDigits:d, maximumFractionDigits:d}) 
  : '—';
export const pct = (p) => (typeof p==='number' && isFinite(p))
  ? (p>=0?'+':'') + p.toFixed(2) + '%'
  : '—';
export const nowPt = () => new Date().toLocaleString('pt-PT');

export function percentChange(current, past) {
  if (!isFinite(current) || !isFinite(past) || past===0) return null;
  return ( (current - past) / past ) * 100.0;
}

export function nearestValueByTimestamp(series, targetTs) {
  // series: array [[ts_ms, value], ...]
  if (!series || !series.length) return null;
  let best = series[0];
  let bestDiff = Math.abs(series[0][0] - targetTs);
  for (const p of series) {
    const diff = Math.abs(p[0] - targetTs);
    if (diff < bestDiff) { best = p; bestDiff = diff; }
  }
  return best[1];
}

export function daysAgoTs(days) {
  return Date.now() - days*24*60*60*1000;
}
