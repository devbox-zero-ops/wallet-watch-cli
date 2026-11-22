import assert from "node:assert/strict"
import test from "node:test"
import { encodeBalanceOf, parseArgs, CHAINS } from "./index.mjs"

test("encodeBalanceOf builds standard ERC-20 balanceOf calldata", () => {
  const data = encodeBalanceOf("0xe4c8739bCC488bD98978CE976511735e0499d432")
  assert.equal(data.length, 2 + 8 + 64)
  assert.ok(data.startsWith("0x70a08231000000000000000000000000"))
  assert.ok(data.endsWith("e4c8739bcc488bd98978ce976511735e0499d432"))
})

test("encodeBalanceOf rejects malformed EVM address", () => {
  assert.throws(() => encodeBalanceOf("0x1234"), /Invalid EVM address/)
})

test("parseArgs parses EVM, Solana, chains, watch, webhook and json flags", () => {
  const opts = parseArgs([
    "--evm", "0xe4c8739bCC488bD98978CE976511735e0499d432",
    "--chains", "base,arbitrum,polygon",
    "--sol", "89XqpaJDKajhYFs4Vmex853yxoEU7HqwnMAPtTDpgZgG",
    "--watch", "30",
    "--webhook", "https://example.com/hook",
    "--json",
  ])
  assert.equal(opts.evm, "0xe4c8739bCC488bD98978CE976511735e0499d432")
  assert.deepEqual(opts.chains, ["base", "arbitrum", "polygon"])
  assert.equal(opts.sol, "89XqpaJDKajhYFs4Vmex853yxoEU7HqwnMAPtTDpgZgG")
  assert.equal(opts.watch, 30)
  assert.equal(opts.webhook, "https://example.com/hook")
  assert.equal(opts.json, true)
  assert.ok(CHAINS.base.usdc)
})
