import { useEffect, useState } from 'react';
import { useConfig } from '../context/ConfigContext';

export default function SettingsModal() {
  const { config, saveConfig, settingsOpen, setSettingsOpen } = useConfig();
  const [form, setForm] = useState(config);

  useEffect(() => {
    if (settingsOpen) setForm(config);
  }, [settingsOpen, config]);

  if (!settingsOpen) return null;

  return (
    <div className="modal-backdrop open" onClick={(e) => e.target === e.currentTarget && setSettingsOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-head-title">Connect your APIs</div>
          <div className="modal-head-sub">Unlock live SoSoValue data & Grok AI briefings</div>
        </div>
        <div className="modal-body">
          <p className="modal-desc">
            Keys are stored in your browser session only. We never send them anywhere except SoSoValue, Grok, or SoDEX.
          </p>
          <div className="form-row">
            <label className="form-label" htmlFor="soso">SoSoValue API key</label>
            <input id="soso" className="form-input" type="password" value={form.sosoKey} onChange={(e) => setForm({ ...form, sosoKey: e.target.value })} placeholder="x-soso-api-key" />
          </div>
          <div className="form-row">
            <label className="form-label" htmlFor="grok">Grok API key</label>
            <input id="grok" className="form-input" type="password" value={form.grokKey} onChange={(e) => setForm({ ...form, grokKey: e.target.value })} placeholder="xai-…" />
          </div>
          <div className="form-row">
            <label className="form-label" htmlFor="sodex">SoDEX API key name</label>
            <input id="sodex" className="form-input" type="password" value={form.sodexKey} onChange={(e) => setForm({ ...form, sodexKey: e.target.value })} placeholder="X-API-Key header · signing scaffold" />
          </div>
          <div className="form-row">
            <label className="form-label" htmlFor="topic">Focus topic</label>
            <input id="topic" className="form-input" type="text" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="e.g. Bitcoin ETF, L2, DeFi" />
          </div>
        </div>
        <div className="modal-foot">
          <button type="button" className="btn-ghost" onClick={() => setSettingsOpen(false)}>Cancel</button>
          <button type="button" className="btn-primary" onClick={() => saveConfig({ ...form, darkMode: true })}>Connect →</button>
        </div>
      </div>
    </div>
  );
}
