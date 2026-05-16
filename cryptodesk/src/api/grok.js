const GROK_BASE = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = 'grok-2';

export class GrokAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async complete(systemPrompt, userPrompt, maxTokens = 1000) {
    const res = await fetch(GROK_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        max_tokens: maxTokens,
        temperature: 0,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });
    if (!res.ok) throw new Error(`Grok API ${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async generateBriefing(newsItems, focusTopic = '') {
    const system = `You are CryptoDesk, an on-chain finance analyst powered by SoSoValue data. Write institutional-grade briefings. No filler.`;
    const headlines = newsItems.slice(0, 20).map((n) => {
      const plain = (n.content || '').replace(/<[^>]+>/g, ' ').slice(0, 150);
      return `• ${n.title}${plain ? ' — ' + plain : ''}`;
    }).join('\n');
    const user = `Feed (${newsItems.length} articles):\n${headlines}\n${focusTopic ? `Focus: ${focusTopic}` : ''}\n\nSections: EXECUTIVE SUMMARY, MARKET SIGNALS, SECTOR SPOTLIGHT, RISK WATCH, 24H CALL. Max 300 words.`;
    return this.complete(system, user, 1000);
  }

  async scoreSignal(newsItem) {
    const user = `Return ONLY JSON for: Title: ${newsItem.title}\nContent: ${(newsItem.content || '').replace(/<[^>]+>/g, ' ').slice(0, 300)}\n{"sentiment":"bullish|bearish|neutral","strength":1-5,"asset":"ticker","reason":"one sentence"}`;
    const raw = await this.complete('JSON only.', user, 150);
    try {
      return JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      return { sentiment: 'neutral', strength: 1, asset: 'MARKET', reason: raw.slice(0, 80) };
    }
  }

  async analyzeArticle(item) {
    const plain = (item.content || '').replace(/<[^>]+>/g, ' ').slice(0, 500);
    return this.complete(
      'Crypto analyst. Be direct.',
      `Title: ${item.title}\n${plain}\n\nSENTIMENT (1-5), KEY INSIGHT, AFFECTED ASSETS, TRADE IMPLICATION. Max 120 words.`,
      300
    );
  }
}
