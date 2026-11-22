#!/usr/bin/env node
import { pathToFileURL } from "node:url"
/**
 * wallet-watch-cli — Zero-dependency multi-chain USDC / native balance watcher
 * Supports Base, Ethereum, Arbitrum, Optimism, Polygon (EVM) and Solana via public RPCs.
 * No API keys, no private keys, 100% read-only.
 */

export const CHAINS = {
  base: {
    rpc: "https://mainnet.base.org",
    nativeSymbol: "ETH",
    usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  },
  ethereum: {
    rpc: "https://cloudflare-eth.com",
    nativeSymbol: "ETH",
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  },
  arbitrum: {
    rpc: "https://arb1.arbitrum.io/rpc",
    nativeSymbol: "ETH",
    usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  },
  optimism: {
    rpc: "https://mainnet.optimism.io",
    nativeSymbol: "ETH",
    usdc: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  },
  polygon: {
    rpc: "https://polygon-rpc.com",
    nativeSymbol: "POL",
    usdc: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  },
}

const SOLANA_RPC = "https://api.mainnet-beta.solana.com"
const SOLANA_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

export function encodeBalanceOf(address) {
  const clean = address.toLowerCase().replace(/^0x/, "")
  if (!/^[0-9a-f]{40}$/.test(clean)) {
    throw new Error(`Invalid EVM address: ${address}`)
  }
  return "0x70a08231" + clean.padStart(64, "0")
}

async function rpcCall(url, payload, timeoutMs = 12000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "wallet-watch-cli/1.0" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(timer)
  }
}

export async function checkEvmChain(chainKey, address) {
  const cfg = CHAINS[chainKey]
  if (!cfg) throw new Error(`Unsupported EVM chain: ${chainKey}`)
  const [nativeRes, usdcRes] = await Promise.all([
    rpcCall(cfg.rpc, { jsonrpc: "2.0", id: 1, method: "eth_getBalance", params: [address, "latest"] }),
    rpcCall(cfg.rpc, {
      jsonrpc: "2.0",
      id: 2,
      method: "eth_call",
      params: [{ to: cfg.usdc, data: encodeBalanceOf(address) }, "latest"],
    }),
  ])
  const nativeWei = BigInt(nativeRes?.result || "0x0")
  const usdcRaw = BigInt(usdcRes?.result || "0x0")
  return {
    chain: chainKey,
    nativeSymbol: cfg.nativeSymbol,
    native: Number(nativeWei) / 1e18,
    usdc: Number(usdcRaw) / 1e6,
  }
}

export async function checkSolana(address) {
  const [balRes, tokRes] = await Promise.all([
    rpcCall(SOLANA_RPC, { jsonrpc: "2.0", id: 1, method: "getBalance", params: [address] }),
    rpcCall(SOLANA_RPC, {
      jsonrpc: "2.0",
      id: 2,
      method: "getTokenAccountsByOwner",
      params: [address, { mint: SOLANA_USDC_MINT }, { encoding: "jsonParsed" }],
    }),
  ])
  const sol = ((balRes?.result?.value ?? 0) / 1e9)
  let usdc = 0
  for (const acc of tokRes?.result?.value ?? []) {
    const amt = acc?.account?.data?.parsed?.info?.tokenAmount?.uiAmount ?? 0
    usdc += Number(amt)
  }
  return { chain: "solana", nativeSymbol: "SOL", native: sol, usdc }
}

export function parseArgs(argv) {
  const opts = { evm: null, sol: null, chains: ["base"], watch: 0, webhook: null, json: false, help: false }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--evm") opts.evm = argv[++i]
    else if (a === "--sol") opts.sol = argv[++i]
    else if (a === "--chains") opts.chains = argv[++i].split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)
    else if (a === "--watch") opts.watch = Math.max(5, Number(argv[++i]) || 60)
    else if (a === "--webhook") opts.webhook = argv[++i]
    else if (a === "--json") opts.json = true
    else if (a === "-h" || a === "--help") opts.help = true
  }
  return opts
}

async function sendWebhook(url, message) {
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: message, text: message }),
  })
}

async function runOnce(opts) {
  const results = []
  if (opts.evm) {
    for (const c of opts.chains) {
      try {
        results.push(await checkEvmChain(c, opts.evm))
      } catch (err) {
        results.push({ chain: c, error: String(err.message || err) })
      }
    }
  }
  if (opts.sol) {
    try {
      results.push(await checkSolana(opts.sol))
    } catch (err) {
      results.push({ chain: "solana", error: String(err.message || err) })
    }
  }
  return { timestamp: new Date().toISOString(), evm: opts.evm, sol: opts.sol, balances: results }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  if (opts.help || (!opts.evm && !opts.sol)) {
    console.log(
      "Usage: wallet-watch --evm 0x... [--chains base,arbitrum,polygon] [--sol <SolanaAddr>] [--watch 60] [--webhook <URL>] [--json]",
    )
    process.exit(opts.help ? 0 : 1)
  }

  let prevKey = null
  const loop = async () => {
    const snap = await runOnce(opts)
    const key = JSON.stringify(snap.balances)
    if (opts.json) {
      console.log(JSON.stringify(snap, null, 2))
    } else {
      console.log(`[${snap.timestamp}]`)
      for (const b of snap.balances) {
        if (b.error) console.log(`  ${b.chain}: ERROR (${b.error})`)
        else console.log(`  ${b.chain}: ${b.usdc.toFixed(4)} USDC | ${b.native.toFixed(6)} ${b.nativeSymbol}`)
      }
    }
    if (prevKey !== null && key !== prevKey && opts.webhook) {
      await sendWebhook(opts.webhook, `Wallet balance changed:\n${JSON.stringify(snap.balances)}`)
    }
    prevKey = key
  }

  await loop()
  if (opts.watch > 0) {
    setInterval(loop, opts.watch * 1000)
  }
}

if (
  process.argv[1] &&
  pathToFileURL(process.argv[1]).href.toLowerCase() ===
    import.meta.url.toLowerCase()
) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
