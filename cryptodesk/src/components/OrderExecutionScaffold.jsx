import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  appendOrderAudit,
  approximatePayloadHash,
  buildCurlPreview,
  buildEip712TypedData,
  buildOrderDraft,
  buildSignedRequestPreview,
  defaultNotionalFromContext,
  loadSodexAccountId,
  mockSignature,
  saveSodexAccountId,
} from '../lib/sodexExecution';

export default function OrderExecutionScaffold({
  executionContext,
  symbol,
  symbols,
  book,
  sodexKey,
  onAuditUpdate,
}) {
  const [accountId, setAccountId] = useState(loadSodexAccountId);
  const [orderType, setOrderType] = useState('MARKET');
  const [notional, setNotional] = useState(() => defaultNotionalFromContext(executionContext));
  const [limitPrice, setLimitPrice] = useState('');
  const [draft, setDraft] = useState(null);
  const [payloadHash, setPayloadHash] = useState('');
  const [typedData, setTypedData] = useState(null);
  const [requestPreview, setRequestPreview] = useState(null);
  const [curl, setCurl] = useState('');
  const [preparing, setPreparing] = useState(false);
  const [auditCount, setAuditCount] = useState(0);

  useEffect(() => {
    setNotional(defaultNotionalFromContext(executionContext));
  }, [executionContext]);

  useEffect(() => {
    saveSodexAccountId(accountId);
  }, [accountId]);

  const sideLabel = useMemo(() => {
    const a = String(executionContext?.action || '').toLowerCase();
    if (a === 'sell') return 'SELL';
    if (a === 'hold') return 'HOLD (no order)';
    return 'BUY';
  }, [executionContext]);

  const prepareOrder = useCallback(async () => {
    if (!executionContext) return;
    setPreparing(true);
    try {
      const symbolMeta = { symbol, symbolID: 1, quantityPrecision: 4, lastPrice: null };
      const symHit = (symbols || []).find((s) => (s.symbol || s.name) === symbol);
      if (symHit) {
        symbolMeta.symbolID = symHit.symbolID ?? symHit.id ?? 1;
        symbolMeta.quantityPrecision = symHit.quantityPrecision ?? 4;
        symbolMeta.lastPrice = symHit.lastTradePrice ?? symHit.lastPrice;
      }

      const body = buildOrderDraft({
        executionContext,
        symbolMeta: { ...symbolMeta, symbol },
        accountID: accountId,
        notionalUsdc: Number(notional) || 100,
        orderType,
        limitPrice,
        book,
      });

      if (body.error) {
        setDraft({ error: body.error });
        return;
      }

      const hash = await approximatePayloadHash(body);
      const nonce = Date.now();
      const eip712 = buildEip712TypedData(hash, nonce);
      const sign = mockSignature();
      const preview = buildSignedRequestPreview({
        body,
        apiKeyName: sodexKey || '<SoDEX-API-Key-Name>',
        nonce,
        signature: sign,
      });

      setDraft(body);
      setPayloadHash(hash);
      setTypedData(eip712);
      setRequestPreview(preview);
      setCurl(buildCurlPreview(preview));

      appendOrderAudit({
        clOrdID: body.orders[0].clOrdID,
        symbol,
        side: body.meta.side,
        type: orderType,
        notionalUsdc: body.meta.notionalUsdc,
        action: executionContext.action,
        status: 'prepared',
      });
      setAuditCount((c) => c + 1);
      onAuditUpdate?.();
    } finally {
      setPreparing(false);
    }
  }, [executionContext, symbol, symbols, book, accountId, notional, orderType, limitPrice, sodexKey, onAuditUpdate]);

  const copyText = (text) => {
    navigator.clipboard?.writeText(text);
  };

  if (!executionContext) {
    return (
      <div className="order-scaffold empty">
        <p className="report-p dim">
          Open an opportunity → <strong>SoDEX</strong> to bind execution context, then prepare a signed order here.
        </p>
      </div>
    );
  }

  if (String(executionContext.action).toLowerCase() === 'hold') {
    return (
      <div className="order-scaffold">
        <p className="report-p dim">Committee recommendation is Hold — no order draft generated.</p>
      </div>
    );
  }

  return (
    <div className="order-scaffold">
      <div className="order-scaffold-head">
        <span className="execution-preview-tag">Wave 4 · Order scaffold</span>
        <span className="order-scaffold-step">Prepare → EIP-712 sign → POST /trade/orders/batch</span>
      </div>

      <div className="order-scaffold-form">
        <label>
          Account ID
          <input
            type="text"
            className="form-input compact"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          />
        </label>
        <label>
          Side
          <input type="text" className="form-input compact" value={sideLabel} readOnly />
        </label>
        <label>
          Notional (USDC)
          <input
            type="number"
            className="form-input compact"
            min="1"
            value={notional}
            onChange={(e) => setNotional(e.target.value)}
          />
        </label>
        <label>
          Order type
          <select
            className="form-input compact"
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
          >
            <option value="MARKET">Market (IOC)</option>
            <option value="LIMIT">Limit (GTC)</option>
          </select>
        </label>
        {orderType === 'LIMIT' && (
          <label>
            Limit price
            <input
              type="text"
              className="form-input compact"
              placeholder="From orderbook"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
            />
          </label>
        )}
      </div>

      <div className="order-scaffold-actions">
        <button
          type="button"
          className="briefing-trigger"
          disabled={preparing}
          onClick={prepareOrder}
        >
          {preparing ? 'Preparing…' : 'Prepare signed order'}
        </button>
        {!sodexKey && (
          <span className="report-p dim">Add SoDEX API key name in Settings for X-API-Key header</span>
        )}
      </div>

      {draft?.error && <p className="hub-error">{draft.error}</p>}

      {draft && !draft.error && (
        <>
          <div className="order-scaffold-block">
            <div className="intel-block-label">1 · Request body</div>
            <pre className="order-json">{JSON.stringify(draft, null, 2)}</pre>
            <button type="button" className="btn-ghost small" onClick={() => copyText(JSON.stringify(draft, null, 2))}>
              Copy JSON
            </button>
          </div>

          <div className="order-scaffold-block">
            <div className="intel-block-label">2 · EIP-712 typed data (ExchangeAction)</div>
            <p className="report-p dim">
              Domain <code>spot</code> · chainId <code>138565</code> · payloadHash ≈ SHA-256(canonical JSON)
            </p>
            <pre className="order-json">{JSON.stringify(typedData, null, 2)}</pre>
            <p className="api-proof">payloadHash: {payloadHash}</p>
          </div>

          <div className="order-scaffold-block">
            <div className="intel-block-label">3 · Signed POST preview</div>
            <pre className="order-json">{JSON.stringify(requestPreview, null, 2)}</pre>
            <button type="button" className="btn-ghost small" onClick={() => copyText(curl)}>
              Copy curl
            </button>
          </div>

          <p className="report-p dim execution-disclaimer">
            Scaffold only — mock signature shown. Live execution requires SoDEX SDK + registered API key private key.
            No order is sent from this UI.
          </p>
        </>
      )}

      {auditCount > 0 && (
        <p className="api-proof">
          Logged to order audit · left nav <strong>📋 Order audit</strong> · {auditCount} this session
        </p>
      )}
    </div>
  );
}
