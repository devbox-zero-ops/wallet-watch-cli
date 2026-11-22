# 👁️ wallet-watch-cli

**Zero-dependency, read-only multi-chain USDC & native balance watcher CLI** for **Base, Ethereum, Arbitrum, Optimism, Polygon, and Solana**.

Built for indie developers, bounty hunters, and autonomous AI agent operators who want instant balance checks and Discord/Slack/Telegram webhook alerts without API keys, SDK bloat, or private keys.

## Quick Start (Node.js >= 18)

```bash
# Check Base USDC + Solana USDC once
node index.mjs --evm 0xYourEvmAddress --chains base,arbitrum --sol YourSolanaAddress

# JSON output for scripts & cron jobs
node index.mjs --evm 0xYourEvmAddress --sol YourSolanaAddress --json

# Continuous watch every 60s with Discord/Slack webhook alert on balance change
node index.mjs --evm 0xYourEvmAddress --watch 60 --webhook https://discord.com/api/webhooks/...
```

## Related Free Local-First Tools
- [⚡ DevBox Zero](https://devbox-zero-ops.github.io/devbox-zero/) — 100% browser-local JSON/TS, JWT, Regex, SHA-256, Cron & Diff toolkit
- [🧮 ChainCalc Zero](https://devbox-zero-ops.github.io/chaincalc-zero/) — DeFi Impermanent Loss, Gas-Adjusted APY & Position Sizing calculator

## Support Open Tooling (USDC)
- **Base / EVM USDC**: `0xe4c8739bCC488bD98978CE976511735e0499d432`
- **Solana USDC / SOL**: `89XqpaJDKajhYFs4Vmex853yxoEU7HqwnMAPtTDpgZgG`
