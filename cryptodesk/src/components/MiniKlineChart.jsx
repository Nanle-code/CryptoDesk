import {
  buildAreaPath,
  buildCandles,
  buildLinePath,
  chartTrend,
  priceChangePct,
} from '../lib/klineChart';

export default function MiniKlineChart({
  bars,
  label,
  proof,
  variant = 'area',
  width = 320,
  height = 120,
}) {
  if (!bars?.length) {
    return (
      <div className="kline-card empty">
        <p className="kline-label">{label}</p>
        <p className="report-p dim">No kline data</p>
        {proof && <p className="api-proof">{proof}</p>}
      </div>
    );
  }

  const trend = chartTrend(bars);
  const chg = priceChangePct(bars);
  const last = bars[bars.length - 1].c;
  const areaPath = buildAreaPath(bars, width, height);
  const linePath = buildLinePath(bars, width, height);
  const candles = variant === 'candle' ? buildCandles(bars, width, height) : [];

  return (
    <div className={`kline-card trend-${trend}`}>
      <div className="kline-head">
        <span className="kline-label">{label}</span>
        <span className="kline-stats">
          {last != null && !Number.isNaN(last) && (
            <strong>{last >= 1000 ? last.toLocaleString(undefined, { maximumFractionDigits: 0 }) : last.toFixed(4)}</strong>
          )}
          {chg != null && (
            <span className={chg >= 0 ? 'up' : 'down'}>
              {chg >= 0 ? '+' : ''}{chg.toFixed(2)}%
            </span>
          )}
        </span>
      </div>
      <svg
        className="kline-svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${label} price chart`}
      >
        {variant === 'area' && areaPath && (
          <>
            <path className="kline-area" d={areaPath} />
            <path className="kline-line" d={linePath} fill="none" />
          </>
        )}
        {variant === 'candle' &&
          candles.map((c, i) => (
            <g key={i} className={c.up ? 'up' : 'down'}>
              <line
                className="kline-wick"
                x1={c.wick.x1}
                y1={c.wick.y1}
                x2={c.wick.x2}
                y2={c.wick.y2}
              />
              <rect className="kline-body" {...c.body} />
            </g>
          ))}
      </svg>
      {proof && <p className="api-proof">{proof}</p>}
    </div>
  );
}
