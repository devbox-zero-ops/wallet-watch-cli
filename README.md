# 👁️ wallet-watch-cli

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Zero-dependency, read-only multi-chain USDT/USDC & native balance watcher CLI** for **Base, Ethereum, Arbitrum, Optimism, Polygon, BSC, and Solana**.

Built for indie developers, bounty hunters, and autonomous AI agent operators who want instant balance checks and Discord/Slack/Telegram webhook alerts without API keys, SDK bloat, or private keys.

## Quick Start (Node.js >= 18)

```bash
# Check EVM USDT (Arbitrum/Polygon/ETH) + Solana USDT once
node index.mjs --evm 0xYourEvmAddress --chains base,arbitrum --sol YourSolanaAddress

# JSON output for scripts & cron jobs
node index.mjs --evm 0xYourEvmAddress --sol YourSolanaAddress --json

# Continuous watch every 60s with Discord/Slack webhook alert on balance change
node index.mjs --evm 0xYourEvmAddress --watch 60 --webhook https://discord.com/api/webhooks/...
```

## Related Free Local-First Tools
- [🚀 XiaheAI ZeroSuite Pro (White-Label 7-in-1 Bundle · 5 USDT / ¥29)](https://devbox-zero-ops.github.io/xiaheai-hub/pro.html) — Self-hostable offline developer suite + 7 interactive calculators
- [⚡ DevBox Zero](https://devbox-zero-ops.github.io/devbox-zero/) — 100% browser-local JSON/TS, JWT, Regex, SHA-256, Cron & Diff toolkit
- [🧮 ChainCalc Zero](https://devbox-zero-ops.github.io/chaincalc-zero/) — DeFi Impermanent Loss, Gas-Adjusted APY & Position Sizing calculator
- [📊 TokenCost Zero](https://devbox-zero-ops.github.io/tokencost-zero/) — Local LLM Token Counter & Multi-Model API Pricing Calculator

## Support Open Tooling (USDT)
- **Base / EVM USDT**: `0xe4c8739bCC488bD98978CE976511735e0499d432`
- **Solana USDT / SOL**: `89XqpaJDKajhYFs4Vmex853yxoEU7HqwnMAPtTDpgZgG`

## Related Open-Source Tools & White-Label Bundle

- **All 8 Zero-Tracking Tools & 10 Cost Calculators**: [XiaheAI Hub](https://devbox-zero-ops.github.io/xiaheai-hub/)
- **Crypto Funding Arbitrage & Polymarket Scanner CLI (Python)**: [quant-radar-cli](https://github.com/devbox-zero-ops/quant-radar-cli)
- **Full 8-App White-Label Self-Hosting Bundle (5 USDT / ¥29)**: [XiaheAI ZeroSuite Pro](https://devbox-zero-ops.github.io/xiaheai-hub/pro.html)
