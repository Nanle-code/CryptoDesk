/** Normalize SoDEX / SoSoValue kline payloads to OHLC bars. */
export function normalizeKlines(raw) {
  if (!raw) return [];
  const arr = Array.isArray(raw)
    ? raw
    : raw.list || raw.klines || raw.data || raw.items || [];
  return (Array.isArray(arr) ? arr : [])
    .map(normalizeBar)
    .filter(Boolean)
    .sort((a, b) => a.t - b.t);
}

function normalizeBar(row) {
  if (Array.isArray(row)) {
    const t = row[0];
    return {
      t: typeof t === 'number' && t < 1e12 ? t * 1000 : t,
      o: parseFloat(row[1]),
      h: parseFloat(row[2]),
      l: parseFloat(row[3]),
      c: parseFloat(row[4]),
      v: parseFloat(row[5]) || 0,
    };
  }
  if (row && typeof row === 'object') {
    const t = row.time ?? row.timestamp ?? row.t ?? row.open_time ?? row.date;
    const close = row.close ?? row.c ?? row.price ?? row.close_price;
    if (close == null && t == null) return null;
    return {
      t: typeof t === 'string' ? new Date(t).getTime() : t,
      o: parseFloat(row.open ?? row.o ?? close),
      h: parseFloat(row.high ?? row.h ?? close),
      l: parseFloat(row.low ?? row.l ?? close),
      c: parseFloat(close),
      v: parseFloat(row.volume ?? row.v ?? 0) || 0,
    };
  }
  return null;
}

export function chartTrend(bars) {
  if (!bars?.length) return 'flat';
  const first = bars[0].c;
  const last = bars[bars.length - 1].c;
  if (last > first * 1.001) return 'up';
  if (last < first * 0.999) return 'down';
  return 'flat';
}

export function priceChangePct(bars) {
  if (!bars?.length || !bars[0].c) return null;
  const last = bars[bars.length - 1].c;
  return ((last - bars[0].c) / bars[0].c) * 100;
}

export function buildAreaPath(bars, width, height, pad = 4) {
  if (!bars?.length) return '';
  const closes = bars.map((b) => b.c).filter((c) => !Number.isNaN(c));
  if (!closes.length) return '';

  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || max * 0.01 || 1;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const points = closes.map((c, i) => {
    const x = pad + (i / Math.max(1, closes.length - 1)) * innerW;
    const y = pad + innerH - ((c - min) / range) * innerH;
    return `${x},${y}`;
  });

  const baseY = pad + innerH;
  return `M ${points[0]} L ${points.slice(1).join(' L ')} L ${pad + innerW},${baseY} L ${pad},${baseY} Z`;
}

export function buildLinePath(bars, width, height, pad = 4) {
  if (!bars?.length) return '';
  const closes = bars.map((b) => b.c).filter((c) => !Number.isNaN(c));
  if (!closes.length) return '';

  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || max * 0.01 || 1;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  return closes
    .map((c, i) => {
      const x = pad + (i / Math.max(1, closes.length - 1)) * innerW;
      const y = pad + innerH - ((c - min) / range) * innerH;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export function buildCandles(bars, width, height, pad = 4) {
  if (!bars?.length) return [];
  const lows = bars.map((b) => b.l);
  const highs = bars.map((b) => b.h);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const range = max - min || max * 0.01 || 1;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  const slot = innerW / bars.length;
  const bodyW = Math.max(2, slot * 0.55);

  return bars.map((b, i) => {
    const cx = pad + i * slot + slot / 2;
    const y = (v) => pad + innerH - ((v - min) / range) * innerH;
    const up = b.c >= b.o;
    const top = y(Math.max(b.o, b.c));
    const bottom = y(Math.min(b.o, b.c));
    const bodyH = Math.max(1, bottom - top);
    return {
      up,
      wick: { x1: cx, y1: y(b.h), x2: cx, y2: y(b.l) },
      body: { x: cx - bodyW / 2, y: top, w: bodyW, h: bodyH },
    };
  });
}
