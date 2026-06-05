import { KLINE_INTERVALS } from '../lib/klineData';
import MiniKlineChart from './MiniKlineChart';
import { sodexSymbolToAsset } from '../lib/sodexSymbol';

export default function KlineChartPanel({
  symbol,
  interval,
  onIntervalChange,
  sodexBars,
  sosoBars,
  loading,
  sosoConnected,
  asset,
}) {
  const base = asset || sodexSymbolToAsset(symbol);

  return (
    <div className="kline-panel">
      <div className="kline-panel-head">
        <h3>
          Price charts · {base}
          <span className="kline-sub">SoDEX + SoSoValue klines</span>
        </h3>
        <div className="kline-intervals">
          {KLINE_INTERVALS.map((iv) => (
            <button
              key={iv.id}
              type="button"
              className={`btn-ghost small ${interval === iv.id ? 'active-preset' : ''}`}
              onClick={() => onIntervalChange?.(iv.id)}
            >
              {iv.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="report-p dim">Loading klines…</p>}

      <div className="kline-grid">
        <MiniKlineChart
          bars={sodexBars}
          label={`SoDEX · ${symbol}`}
          proof={`GET /markets/${symbol}/klines?interval=${interval}`}
          variant="candle"
        />
        <MiniKlineChart
          bars={sosoBars}
          label={sosoConnected ? `SoSoValue · ${base}` : `SoSoValue · ${base} (connect key)`}
          proof={sosoConnected ? `GET /currencies/{id}/klines · interval=${interval}` : 'Add SoSoValue key in Settings'}
          variant="area"
        />
      </div>
    </div>
  );
}
