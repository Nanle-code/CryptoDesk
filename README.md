# CryptoDesk — AI-Powered On-Chain Finance Intelligence

> 🚀 **Live Demo:** [https://your-username.github.io/cryptodesk-project](https://your-username.github.io/cryptodesk-project)
> 
> A one-person crypto intelligence business powered by SoSoValue API × Grok AI
> Built for SoSoValue Buildathon 2026 | 🏆 **Wave 1 Complete**

---

## ✨ What is CryptoDesk?

CryptoDesk is an **elite crypto intelligence terminal** that functions as a one-person crypto news agency and trading desk. It transforms raw market data into actionable intelligence through AI-powered analysis.

### 🎯 Current Capabilities (Wave 1 ✅)
- **📰 Live News Feed**: Real-time crypto news from SoSoValue API
- **🤖 AI Briefings**: Grok-powered market intelligence and analysis  
- **📅 Macro Calendar**: Economic events and market-moving catalysts
- **📊 Sector Spotlight**: Real-time sector performance and trends
- **📈 Market Tickers**: Live price data for major cryptocurrencies
- **🔗 Source Links**: Direct access to original news sources
- **📱 Responsive Design**: Works seamlessly on desktop and mobile

### 🎨 Design Philosophy
- **Aesthetic**: Financial broadsheet meets Bloomberg terminal
- **Typography**: Playfair Display + IBM Plex Mono + Barlow
- **Color Palette**: Newsprint ivory with ink black and signal red accents
- **Architecture**: Single-file deployment for maximum reliability

---

## 📁 Project Structure

```
cryptodesk/
├── index.html              # 🚀 Main application (single-file, production-ready)
├── index-v2.html          # 🔄 Enhanced version (in development)
├── README.md              # 📖 Project documentation
├── manifest.json          # 📱 PWA configuration
│
├── src/
│   ├── api/               # 🔌 API integration layer
│   │   ├── sosovalue.js   # SoSoValue data API client
│   │   ├── grok.js        # Grok AI client  
│   │   ├── claude.js      # Claude AI client (legacy)
│   │   └── sodex.js       # SoDEX trading API (Wave 3)
│   │
│   ├── components/        # 🧩 Reusable UI components
│   │   └── VirtualList.js # High-performance list rendering
│   │
│   ├── core/             # ⚙️ Application core
│   │   ├── app.js        # Main application controller
│   │   ├── state.js      # State management
│   │   └── motion.js     # Animation engine
│   │
│   ├── styles/           # 🎨 Styling system
│   │   ├── design-system.css
│   │   ├── components.css
│   │   └── animations.css
│   │
│   └── utils/            # 🛠️ Utility functions
│       ├── format.js     # Data formatting
│       └── intelligence.js # AI processing utilities
│
├── docs/                # 📚 Documentation
│   └── ROADMAP.md       # Buildathon roadmap
│
└── SECURITY.md          # 🔐 Security guidelines
```

---

## 🚀 Quick Start & Deployment

### 🎯 Try It Now (No Installation Required)
1. **Live Demo**: [Open CryptoDesk](https://your-username.github.io/cryptodesk-project/cryptodesk/index.html)
2. Click **⚙ Settings** (top-right)
3. Enter your API keys:
   - **SoSoValue API Key**: Get from [SoSoValue Developer Portal](https://sosovalue.com)
   - **Grok API Key**: Get from [XAI Platform](https://x.ai)
4. Click **Connect** and start exploring!

### 🛠️ Local Development
```bash
# Clone the repository
git clone https://github.com/your-username/cryptodesk-project.git
cd cryptodesk-project

# Start local server
python3 -m http.server 8000
# or
npx serve .

# Open in browser
open http://localhost:8000/cryptodesk/index.html
```

### 🌐 Deployment Options

#### GitHub Pages (Recommended)
```bash
# Deploy to GitHub Pages
git subtree push --prefix cryptodesk origin gh-pages
```

#### Netlify/Vercel
1. Connect your repository
2. Set build directory: `cryptodesk`
3. Deploy automatically on every push

#### Static Hosting
Upload the entire `cryptodesk/` folder to any static host (AWS S3, Firebase Hosting, etc.)

### ⚙️ Configuration
- **API Keys**: Stored in browser session only (never saved to disk)
- **No Build Step**: Single HTML file - just open and use
- **Offline Ready**: Works without internet (cached data)
- **PWA Support**: Install as desktop app (manifest.json included)

---

## 🔌 API Integration

### Currently Implemented (Wave 1 ✅)
| Service | Purpose | Authentication |
|---------|---------|----------------|
| **SoSoValue API** | Real-time news, market data, macro events | `x-soso-api-key` header |
| **Grok AI (XAI)** | Market intelligence, briefings, analysis | Bearer token authentication |

### Planned Integration (Wave 2-3)
| Service | Purpose | Status |
|---------|---------|--------|
| **SoSoValue Indices** | Index tracking, constituents | 🔄 Coming Soon |
| **ETF Flow Data** | Institutional flow monitoring | 🔄 Coming Soon |
| **BTC Treasuries** | Corporate Bitcoin holdings | 🔄 Coming Soon |
| **SoDEX Trading** | Order execution, portfolio | ⏳ Wave 3 |

---

## 🎯 Key Features

### 📰 News & Intelligence
- **Real-time Feed**: Live crypto news from SoSoValue
- **Smart Filtering**: By category, source, and keywords
- **AI Analysis**: Grok-powered market insights
- **Source Links**: Direct access to original articles

### 📊 Market Data
- **Live Tickers**: BTC, ETH, SOL, BNB prices
- **Sector Performance**: Real-time sector trends
- **Macro Calendar**: Economic events and catalysts
- **Market Sentiment**: AI-driven sentiment analysis

### 🎨 User Experience
- **Responsive Design**: Desktop, tablet, mobile optimized
- **Dark/Light Mode**: Automatic theme switching
- **Keyboard Navigation**: Full keyboard accessibility
- **Offline Support**: Cached data for offline viewing

---

## 🛠️ Technical Architecture

### Frontend Stack
- **Languages**: Vanilla HTML5, CSS3, JavaScript ES6+
- **Architecture**: Single-page application (SPA)
- **State Management**: Custom reactive state system
- **Styling**: CSS custom properties, fluid typography
- **Performance**: Virtual scrolling, lazy loading

### Data Flow
```
SoSoValue API → CryptoDesk → Grok AI → User Interface
     ↓               ↓            ↓
Real-time data → Processing → Intelligence → Actionable insights
```

### Security & Performance
- **API Keys**: Browser session storage only
- **HTTPS Only**: All API communications encrypted
- **Rate Limiting**: Intelligent request throttling
- **Caching**: Strategic data caching for performance
- **CORS**: Proper cross-origin resource sharing

---

## 🏆 Buildathon Progress

### ✅ Wave 1 Complete 
- [x] Live news feed integration
- [x] AI-powered briefings
- [x] Market data display
- [x] Responsive design
- [x] Single-file deployment
- [x] Security implementation

### 🔄 Wave 2 In Progress
- [ ] Index tracking dashboard
- [ ] ETF flow monitoring
- [ ] Signal detection engine
- [ ] Interactive charts
- [ ] User preferences

### ⏳ Wave 3 Planned
- [ ] Trading execution via SoDEX
- [ ] Portfolio management
- [ ] Risk controls
- [ ] Automated strategies

---

## 🤝 Contributing

### Development Setup
```bash
# Fork and clone
git clone https://github.com/your-username/cryptodesk-project.git
cd cryptodesk-project

# Start development server
python3 -m http.server 8000

# Make changes and test
# Open http://localhost:8000/cryptodesk/index.html
```

### Code Style
- **Indentation**: 2 spaces
- **Comments**: JSDoc for functions
- **Naming**: camelCase for variables, PascalCase for classes
- **Security**: Never commit API keys or sensitive data

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---


***Powered by [SoSoValue](https://sosovalue.com) × [XAI Grok](https://x.ai)*
