import { useEffect, useState } from 'react';
import { createSoSoClient } from '../api/sosovalue';
import { apiProof } from '../lib/api';
import { fmtPct, fmtUsd, sectorLabel } from '../lib/format';

function Card({ title, proof, children }) {
  return (
    <div className="hub-card">
      <div className="hub-card-head">
        <span>{title}</span>
        {proof && <code className="hub-proof">{proof}</code>}
      </div>
      <div className="hub-card-body">{children}</div>
    </div>
  );
}

export default function SoSoDashboard({ apiKey }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!apiKey) {
      setLoading(false);
      return;
    }
    const soso = createSoSoClient(apiKey);
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [sectors, etfBtc, etfEth, macro, indices, treasuries, fundraising, etfs] = await Promise.all([
          soso.getSectorSpotlight(),
          soso.getETFSummaryHistory({ symbol: 'BTC', country_code: 'US', limit: 7 }),
          soso.getETFSummaryHistory({ symbol: 'ETH', country_code: 'US', limit: 7 }),
          soso.getMacroEvents(),
          soso.getIndices(),
          soso.getBTCTreasuries({ limit: 8 }),
          soso.getFundraising({ limit: 8 }),
          soso.getETFs(),
        ]);
        setData({
          sectors: [...(sectors?.sector || []), ...(sectors?.spotlight || [])],
          etfBtc: Array.isArray(etfBtc) ? etfBtc : [],
          etfEth: Array.isArray(etfEth) ? etfEth : [],
          macro: Array.isArray(macro) ? macro : [],
          indices: Array.isArray(indices) ? indices : indices?.list || [],
          treasuries: Array.isArray(treasuries) ? treasuries : treasuries?.list || [],
          fundraising: Array.isArray(fundraising) ? fundraising : fundraising?.list || [],
          etfs: Array.isArray(etfs) ? etfs : etfs?.list || [],
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [apiKey]);

  if (!apiKey) {
    return (
      <div className="hub-empty">
        <h2>SoSoValue Analytics</h2>
        <p>Connect your SoSoValue API key to load indices, ETF flows, treasuries, sectors, macro, and fundraising data.</p>
      </div>
    );
  }

  if (loading) return <div className="hub-loading">Loading SoSoValue data modules…</div>;
  if (error) return <div className="hub-error">{error}</div>;
  if (!data) return null;

  const etfLatest = data.etfBtc[0];

  return (
    <div className="hub-scroll">
      <div className="hub-hero">
        <h2>SoSoValue Intelligence Hub</h2>
        <p>Live data from 8+ SoSoValue OpenAPI endpoints — news, indices, ETF flows, on-chain treasuries, and macro.</p>
        <div className="hub-endpoint-count">8 parallel API calls</div>
      </div>

      <div className="hub-grid">
        <Card title="₿ BTC ETF flows (US)" proof="GET /etfs/summary-history">
          {etfLatest && (
            <div className="hub-stat" style={{ color: parseFloat(etfLatest.total_net_inflow) >= 0 ? 'var(--bull)' : 'var(--bear)' }}>
              {fmtUsd(etfLatest.total_net_inflow)}
              <span className="hub-stat-sub">latest · {etfLatest.date}</span>
            </div>
          )}
          {data.etfBtc.slice(0, 5).map((r) => (
            <div key={r.date} className="hub-row">
              <span>{r.date}</span>
              <span style={{ color: parseFloat(r.total_net_inflow) >= 0 ? 'var(--bull)' : 'var(--bear)' }}>{fmtUsd(r.total_net_inflow)}</span>
            </div>
          ))}
        </Card>

        <Card title="Ξ ETH ETF flows (US)" proof="GET /etfs/summary-history?symbol=ETH">
          {(data.etfEth[0]) && (
            <div className="hub-stat" style={{ color: parseFloat(data.etfEth[0].total_net_inflow) >= 0 ? 'var(--bull)' : 'var(--bear)' }}>
              {fmtUsd(data.etfEth[0].total_net_inflow)}
            </div>
          )}
          {data.etfEth.slice(0, 4).map((r) => (
            <div key={r.date} className="hub-row">
              <span>{r.date}</span>
              <span>{fmtUsd(r.total_net_inflow)}</span>
            </div>
          ))}
        </Card>

        <Card title="◈ Sector spotlight" proof="GET /currencies/sector-spotlight">
          {data.sectors.slice(0, 6).map((s) => (
            <div key={s.name} className="hub-row">
              <span>{sectorLabel(s.name)}</span>
              <span>{fmtPct(s['24h_change_pct'])}</span>
            </div>
          ))}
        </Card>

        <Card title="◆ SSI indices" proof="GET /indices">
          {data.indices.slice(0, 6).map((idx, i) => (
            <div key={i} className="hub-row">
              <span className="hub-ticker">{idx.ticker || idx.symbol}</span>
              <span>{idx.name || ''}</span>
            </div>
          ))}
        </Card>

        <Card title="🏦 BTC treasuries" proof="GET /btc-treasuries">
          {data.treasuries.slice(0, 6).map((t, i) => (
            <div key={i} className="hub-row">
              <span>{t.ticker || t.name || t.company_name}</span>
              <span>{t.btc_holdings ?? t.holdings ?? '—'}</span>
            </div>
          ))}
        </Card>

        <Card title="🚀 Fundraising" proof="GET /fundraising/projects">
          {data.fundraising.slice(0, 5).map((p, i) => (
            <div key={i} className="hub-row">
              <span>{(p.name || p.project_name || '').slice(0, 28)}</span>
              <span>{p.amount ? fmtUsd(p.amount) : '—'}</span>
            </div>
          ))}
        </Card>

        <Card title="⊡ Macro calendar" proof="GET /macro/events">
          {data.macro.slice(0, 5).map((d) => (
            <div key={d.date} className="hub-row">
              <span>{d.date}</span>
              <span>{(d.events || []).length} events</span>
            </div>
          ))}
        </Card>

        <Card title="📋 ETF list" proof="GET /etfs">
          {data.etfs.slice(0, 5).map((e, i) => (
            <div key={i} className="hub-row">
              <span>{e.ticker || e.symbol}</span>
              <span>{e.name || ''}</span>
            </div>
          ))}
        </Card>
      </div>

      <p className="api-proof hub-footer">{apiProof('SoSoValue OpenAPI v1 · parallel fetch')}</p>
    </div>
  );
}
