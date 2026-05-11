/**
 * Grok AI Client
 * Powers AI briefings, signal analysis, and index recommendations
 */

const GROK_BASE = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = 'grok-2';

class GrokAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async complete(systemPrompt, userPrompt, maxTokens = 1000) {
    const body = {
      model: GROK_MODEL,
      max_tokens: maxTokens,
      temperature: 0,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    };

    const res = await fetch(GROK_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(`Grok API ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  /** Generate daily briefing from news items */
  async generateBriefing(newsItems, focusTopic = '') {
    const system = `You are CryptoDesk, an elite on-chain finance intelligence analyst powered by SoSoValue real-time data. 
You write sharp, institutional-grade market briefings. Be specific, data-driven, and confident.
Never use filler phrases. Every sentence must contain actionable information.`;

    const headlines = newsItems.slice(0, 20).map(n => {
      const plain = (n.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 150);
      return `• [${n.category_name || 'News'}] ${n.title}${plain ? ' — ' + plain : ''}`;
    }).join('\n');

    const user = `Today's SoSoValue data feed (${newsItems.length} articles):
${headlines}
${focusTopic ? `\nUser focus: ${focusTopic}` : ''}

Write a DAILY INTELLIGENCE BRIEFING with these exact sections:

EXECUTIVE SUMMARY
2-3 sentences. The dominant narrative. What is the market doing and why.

KEY SIGNALS
3 specific signals (bullish/bearish/neutral). Format: [SIGNAL TYPE] Asset/Sector — observation — implication.

SECTOR SPOTLIGHT  
Which sector is hottest right now and what's driving it. 2-3 sentences.

RISK WATCH
1-2 specific risks visible in today's data. No generic macro platitudes.

24H CALL
One bold, specific prediction for the next 24 hours. Commit to it.

Max 320 words. No markdown headers with ##. Use the section names exactly as shown above.`;

    return this.complete(system, user, 1000);
  }

  /** Score a single news item for market sentiment */
  async scoreSignal(newsItem) {
    const system = `You are a crypto market signal detector. Respond only with a JSON object.`;
    const user = `Analyze this crypto news and return ONLY a JSON object with no other text:
Title: ${newsItem.title}
Content: ${(newsItem.content || '').replace(/<[^>]+>/g, ' ').slice(0, 300)}

Return: {"sentiment": "bullish"|"bearish"|"neutral", "strength": 1-5, "asset": "ticker or sector", "reason": "one sentence max"}`;

    const raw = await this.complete(system, user, 150);
    try {
      return JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      return { sentiment: 'neutral', strength: 1, asset: 'MARKET', reason: raw.slice(0, 80) };
    }
  }

  /** Generate index composition recommendation */
  async recommendIndex(sectorData, userGoal) {
    const system = `You are an on-chain index designer powered by SoSoValue index data. Design precise, investable crypto indices.`;
    const user = `Based on current SoSoValue sector data, design a crypto index for this goal: "${userGoal}"

Sector performance data:
${JSON.stringify(sectorData, null, 2)}

Return ONLY a JSON object:
{
  "name": "Index Name",
  "ticker": "TICKER",
  "description": "One sentence",
  "thesis": "2 sentence investment thesis",
  "constituents": [
    {"symbol": "BTC", "weight": 40, "rationale": "one sentence"},
    ...
  ],
  "rebalance_frequency": "monthly|weekly|quarterly"
}`;

    const raw = await this.complete(system, user, 800);
    try {
      return JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      return null;
    }
  }
}

window.GrokAPI = GrokAPI;
