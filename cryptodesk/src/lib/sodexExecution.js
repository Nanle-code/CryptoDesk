/** SoDEX spot testnet — EIP-712 execution scaffold (Wave 4). */

export const SODEX_SPOT_TESTNET = 'https://testnet-gw.sodex.dev/api/v1/spot';
export const SODEX_TESTNET_CHAIN_ID = 138565;

export const ORDER_SIDE = { BUY: 1, SELL: 2 };
export const ORDER_TYPE = { LIMIT: 1, MARKET: 2 };
export const TIME_IN_FORCE = { GTC: 1, IOC: 3 };

const STORAGE_ACCOUNT = 'cd_sodex_account';
const STORAGE_AUDIT = 'cd_order_audit';

export function loadSodexAccountId() {
  return sessionStorage.getItem(STORAGE_ACCOUNT) || '1001';
}

export function saveSodexAccountId(id) {
  sessionStorage.setItem(STORAGE_ACCOUNT, String(id));
}

export function loadOrderAudit() {
  try {
    const raw = sessionStorage.getItem(STORAGE_AUDIT);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendOrderAudit(entry) {
  const prev = loadOrderAudit();
  const next = [{ ...entry, at: new Date().toISOString() }, ...prev].slice(0, 50);
  sessionStorage.setItem(STORAGE_AUDIT, JSON.stringify(next));
  return next;
}

export function clearOrderAudit() {
  sessionStorage.removeItem(STORAGE_AUDIT);
  return [];
}

export function exportOrderAuditJson(entries) {
  return JSON.stringify(entries, null, 2);
}

/** Resolve symbolID from SoDEX symbols list. */
export function resolveSymbolMeta(symbol, symbols = []) {
  const hit = (symbols || []).find(
    (s) => (s.symbol || s.name || s.s) === symbol
  );
  return {
    symbol,
    symbolID: hit?.symbolID ?? hit?.id ?? hit?.symbolId ?? 1,
    pricePrecision: hit?.pricePrecision ?? 2,
    quantityPrecision: hit?.quantityPrecision ?? 4,
    lastPrice: hit?.lastTradePrice ?? hit?.lastPrice ?? hit?.price,
  };
}

export function actionToSide(action) {
  const a = String(action || '').toLowerCase();
  if (a === 'sell' || a === 'short') return ORDER_SIDE.SELL;
  if (a === 'hold' || a === 'wait') return null;
  return ORDER_SIDE.BUY;
}

export function makeClientOrderId() {
  return `cd-${Date.now().toString(36)}`;
}

/** Build BatchNewOrderRequest body from execution preview context. */
export function buildOrderDraft({
  executionContext,
  symbolMeta,
  accountID,
  notionalUsdc = 100,
  orderType = 'MARKET',
  limitPrice,
  book,
}) {
  const side = actionToSide(executionContext?.action);
  if (!side) return { error: 'Hold — no executable side from recommendation.' };

  const isMarket = orderType === 'MARKET';
  const bestAsk = parseBookTop(book?.asks || book?.a, 'ask');
  const bestBid = parseBookTop(book?.bids || book?.b, 'bid');
  const refPrice = parseFloat(symbolMeta.lastPrice) || bestAsk || bestBid || 0;

  let price = limitPrice;
  let quantity;
  let funds;

  if (isMarket) {
    if (side === ORDER_SIDE.BUY) {
      funds = notionalUsdc.toFixed(2);
    } else {
      quantity = refPrice > 0 ? (notionalUsdc / refPrice).toFixed(symbolMeta.quantityPrecision) : '0.01';
    }
  } else {
    price = String(limitPrice || bestAsk || bestBid || refPrice || '0');
    quantity = refPrice > 0 ? (notionalUsdc / parseFloat(price)).toFixed(symbolMeta.quantityPrecision) : '0.01';
  }

  const item = {
    symbolID: Number(symbolMeta.symbolID) || 1,
    clOrdID: makeClientOrderId(),
    side,
    type: isMarket ? ORDER_TYPE.MARKET : ORDER_TYPE.LIMIT,
    timeInForce: isMarket ? TIME_IN_FORCE.IOC : TIME_IN_FORCE.GTC,
  };

  if (price && !isMarket) item.price = price;
  if (quantity) item.quantity = quantity;
  if (funds) item.funds = funds;

  return {
    accountID: Number(accountID) || 1001,
    orders: [item],
    meta: {
      symbol: symbolMeta.symbol,
      side: side === ORDER_SIDE.BUY ? 'BUY' : 'SELL',
      orderType,
      notionalUsdc,
      refPrice,
    },
  };
}

function parseBookTop(rows, side) {
  const row = rows?.[0];
  if (!row) return null;
  const p = row[0] ?? row.price;
  const v = parseFloat(p);
  return Number.isNaN(v) ? null : v;
}

export function defaultNotionalFromContext(context, capital = 1000) {
  const pct = context?.allocation_pct ?? 15;
  return Math.round((capital * pct) / 100);
}

/** EIP-712 ExchangeAction preview (signing happens client-side with private key / SDK). */
export function buildEip712TypedData(payloadHash, nonce = Date.now()) {
  return {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      ExchangeAction: [
        { name: 'payloadHash', type: 'bytes32' },
        { name: 'nonce', type: 'uint64' },
      ],
    },
    domain: {
      name: 'spot',
      version: '1',
      chainId: SODEX_TESTNET_CHAIN_ID,
      verifyingContract: '0x0000000000000000000000000000000000000000',
    },
    primaryType: 'ExchangeAction',
    message: {
      payloadHash,
      nonce,
    },
  };
}

/** Approximate payload hash for demo — production must use SoDEX SDK canonical JSON. */
export async function approximatePayloadHash(payload) {
  const canonical = JSON.stringify(payload);
  if (typeof crypto !== 'undefined' && crypto.subtle?.digest) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
    const hex = Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `0x${hex}`;
  }
  return '0x<sha256-of-canonical-payload — use SoDEX Go SDK>';
}

export function buildSignedRequestPreview({ body, apiKeyName, nonce, signature }) {
  return {
    method: 'POST',
    url: `${SODEX_SPOT_TESTNET}/trade/orders/batch`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-Key': apiKeyName || '<API-Key-Name>',
      'X-API-Sign': signature || '0x01<65-byte-ecdsa-signature>',
      'X-API-Nonce': String(nonce),
    },
    body,
  };
}

export function buildCurlPreview(preview) {
  const headers = Object.entries(preview.headers)
    .map(([k, v]) => `-H '${k}: ${v}'`)
    .join(' \\\n  ');
  return `curl -X POST '${preview.url}' \\\n  ${headers} \\\n  -d '${JSON.stringify(preview.body)}'`;
}

/** Mock signature for judge demo (not valid on gateway). */
export function mockSignature() {
  return `0x01${'ab'.repeat(32)}cd`;
}
