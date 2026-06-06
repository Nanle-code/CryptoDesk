# CryptoDesk Wave 3 Strategy & Product Roadmap

> **Implementation status (June 2026):** Milestones **M1–M13** are shipped. **Live SoDEX POST** uses an EIP-712 order scaffold (prepare → sign preview → curl) — no orders are sent from the browser. Use ** Judge demo** for the guided 7-step judge flow.

| Milestone | Feature | Status |
|-----------|---------|--------|
| M1 | AI signal classification (Grok top 5 on load) |  Shipped |
| M2 | Opportunity discovery engine |  Shipped |
| M3 | Investment committee (4 agents) |  Shipped |
| M4 | Research copilot |  Shipped |
| M5 | Auto explainability (Why? / Risks) |  Shipped |
| M6 | Narrative tracking |  Shipped |
| M7 | Portfolio agent |  Shipped |
| M8 | Daily briefing (Grok) |  Shipped (Wave 2) |
| M9 | Watchlist + sentiment + narrative alerts |  Shipped |
| M10 | SoDEX terminal (public REST) |  Shipped (Wave 2) |
| M11 | SSI index builder + live constituents |  Shipped |
| M12 | Unified execution preview card |  Shipped |
| M13 | Strategy generator (any opportunity) |  Shipped |
| — | Live SoDEX signed orders |  Scaffold (EIP-712 preview; no live POST) |
| — | Judge demo wizard (steps 1–7) |  Shipped |
| — | Persistent signal archive (session) |  Shipped |
| — | Kline charts (SoDEX + SoSoValue) |  Shipped |
| — | EIP-712 order execution scaffold |  Shipped |
| — | Order audit log panel |  Shipped |

## Vision

CryptoDesk is not a crypto news dashboard.

CryptoDesk is an AI-powered Opportunity Discovery and Execution Intelligence Platform that transforms market information into actionable investment decisions.

Instead of helping users consume information, CryptoDesk helps users answer:

* What is happening?
* Why does it matter?
* What opportunity exists?
* What are the risks?
* What should I do next?
* How can I execute it?

---

# Hackathon Alignment

## SoSoValue Buildathon Objectives

CryptoDesk directly aligns with:

### Required

 SoSoValue API Integration

 Clear User Value

 Complete Data-to-Decision Flow

 Verifiable Demo

 Documentation

### Bonus

 SoDEX Integration

 AI-Powered Analysis

 Opportunity Discovery

 Strategy Assistant

 Risk Control

 Decision Support

 Research-to-Execution Workflow

---

# Product Positioning

## Old Positioning

Crypto Intelligence Dashboard

### User Flow

News
↓
Read
↓
Leave Platform

---

## New Positioning

AI Financial Intelligence Terminal

### User Flow

Market Data
↓
AI Analysis
↓
Opportunity Discovery
↓
Strategy Generation
↓
Risk Assessment
↓
Execution Planning
↓
SoDEX Preview

---

# Core Product Architecture

## Layer 1

Market Intelligence Layer

Sources:

* SoSoValue News
* SoSoValue Market Data
* SoSoValue Hot News
* SoSoValue Featured News
* SoSoValue Currency Data

Output:

Raw Information

---

## Layer 2

Signal Intelligence Layer

Current:

Keyword Scoring

Future:

~~AI-Powered Classification~~ ** Shipped** — Grok auto-classifies top 5 on feed load

Output:

Bullish
Bearish
Neutral

Confidence Score

Affected Assets

Time Horizon

---

## Layer 3

Opportunity Discovery Engine

Purpose:

Convert signals into opportunities.

Output Example

Opportunity #1

Asset:
ETH

Confidence:
89%

Risk:
Medium

Time Horizon:
3-7 Days

Reason:

* ETF inflows increasing
* Positive market sentiment
* Institutional accumulation

Suggested Action:

Accumulate

---

# Feature Roadmap

---

# Milestone 1

AI Signal Classification Engine

Priority:
HIGH

Current State:

Keyword-Based Signals

Problem:

Low intelligence
Easy to replicate

Solution:

Use Grok AI

Input:

Headline

Example

"Ethereum ETF inflows hit record levels"

AI Output

{
"sentiment": "bullish",
"confidence": 92,
"affected_assets": ["ETH"],
"impact": "high",
"time_horizon": "medium"
}

Benefits

* Better signals
* Better recommendations
* Higher judge score

---

# Milestone 2

Opportunity Discovery Engine

Priority:
CRITICAL

Purpose

Convert news into opportunities.

Example

Input:

Positive ETF News

Output

 Opportunity

Asset:
ETH

Confidence:
91%

Risk:
Medium

Suggested Action:
Buy

Expected Horizon:
7 Days

Why

* ETF inflow growth
* Positive sentiment
* Strong volume trend

Benefits

* Directly aligns with Buildathon requirements
* Creates user value

---

# Milestone 3

Confidence Engine

Priority:
HIGH

Every recommendation must include:

Confidence

Risk

Time Horizon

Example

ETH

Confidence:
87%

Risk:
Medium

Time Horizon:
5 Days

Without this:

Recommendations feel random.

With this:

Recommendations feel professional.

---

# Milestone 4

Risk Assessment Agent

Priority:
HIGH

Purpose

Balance opportunity with risk.

Example

Recommendation:

Buy ETH

Risks:

* FOMC meeting tomorrow
* Elevated volatility
* Weak BTC correlation

Final Rating:

Medium Risk

---

# Milestone 5

Explainability Layer

Priority:
HIGH

Every AI output must answer:

Why?

Example

Recommendation

Buy ETH

Reasons

* ETF inflows rising

* Positive sentiment

* Institutional demand

Risks

* Macro uncertainty

* Potential profit-taking

Benefits

Builds trust.

---

# Milestone 6

AI Research Copilot

Priority:
HIGH

User Prompts

Examples

Why is ETH bullish today?

What are today's biggest risks?

Summarize the market.

What opportunities exist?

What is the strongest narrative?

Output

Research-grade answers.

---

# Milestone 7

Narrative Rotation Engine

Priority:
HIGH

Purpose

Detect capital flow shifts.

Example

Current Narrative

AI Tokens

Momentum:
Weakening

Emerging Narrative

RWA Tokens

Momentum:
Strengthening

Agent Insight

Capital appears to be rotating from AI assets into RWAs.

Benefits

Provides unique intelligence.

---

# Milestone 8

AI Investment Committee

Priority:
VERY HIGH

Agents

Analyst Agent

Risk Agent

Macro Agent

Execution Agent

Workflow

News
↓
Analyst Review
↓
Risk Review
↓
Macro Review
↓
Execution Review
↓
Final Recommendation

Example

Analyst:
Bullish ETH

Risk:
Medium Risk

Macro:
Positive

Execution:
Recommended

Final

Buy ETH

Confidence:
82%

Risk:
Medium

---

# Milestone 9

Watchlist Agent

Priority:
MEDIUM

User Adds

BTC

ETH

SOL

Agent Monitors

Signals

Narratives

Sentiment

Alerts

Example

ETH confidence exceeded 90%.

New opportunity detected.

---

# Milestone 10

Portfolio Intelligence Agent

Priority:
CRITICAL

Input

Capital:
$1,000

Risk:
Medium

Goal:
Growth

Output

Portfolio

40% BTC

30% ETH

20% SOL

10% AI Index

Reasoning

Provided for every allocation.

Benefits

Massive user value.

---

# Milestone 11

SSI Index Builder

Priority:
VERY HIGH

Purpose

Leverage SSI Protocol.

User Prompt

Build AI Index

Output

AI Index

40% TAO

30% FET

20% RENDER

10% AKT

Methodology

AI relevance

Market cap

Momentum

Liquidity

Benefits

Direct SSI integration.

---

# Milestone 12

SoDEX Execution Preview

Priority:
VERY HIGH

Purpose

Complete research-to-execution flow.

Workflow

Opportunity
↓
Recommendation
↓
Trade Preview
↓
SoDEX Execution Route

Example

Buy ETH

Confidence:
88%

Suggested Allocation:
15%

Estimated Slippage:
0.12%

Execution Route:
SoDEX

---

# Milestone 13

Strategy Generator

Priority:
HIGH

Output Example

Strategy

Name:
Ethereum ETF Momentum

Entry:
Current Levels

Risk:
Medium

Time Horizon:
14 Days

Exit Criteria

ETF inflows weaken

Sentiment turns negative

---

# Demo Flow

## Demo Scenario

Judge Opens CryptoDesk

Step 1

Breaking News Arrives

Ethereum ETF inflows reach all-time high.

---

Step 2

AI Classification

Bullish

Confidence:
93%

Affected Asset:
ETH

---

Step 3

Opportunity Engine

 Opportunity Detected

Asset:
ETH

Confidence:
91%

Risk:
Medium

---

Step 4

Investment Committee

Analyst:
Bullish

Risk Agent:
Medium

Macro:
Positive

Execution:
Approved

---

Step 5

Portfolio Agent

Suggested Allocation

15% ETH

---

Step 6

Execution Preview

Trade Route:
SoDEX

Estimated Slippage:
0.12%

---

Step 7

Explainability

Why?

ETF inflows increasing

Institutional demand rising

Positive market sentiment

---

Final Outcome

The user moved from:

Information

to

Insight

to

Decision

to

Execution

inside a single product.

---

# Final Product Narrative

CryptoDesk transforms fragmented crypto information into AI-generated investment opportunities, portfolio strategies, and execution-ready actions.

Rather than acting as a news terminal, CryptoDesk functions as an AI financial analyst, portfolio manager, research assistant, and execution copilot built on top of SoSoValue, SSI Protocol, and SoDEX.

This directly fulfills the Buildathon vision of enabling a one-person financial intelligence platform powered by AI and on-chain infrastructure.
