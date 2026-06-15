import { describe, expect, test } from "vitest";
import { format } from "./stablecoin";
import {
  compareToBaseline,
  humanizeSeconds,
  quotePayout,
  settle,
} from "./payout";

const base = {
  amountUsd: "1000.00",
  platformFeeBps: 50, // 0.50%
  fxSpreadBps: 0,
  instant: true,
} as const;

describe("quotePayout", () => {
  test("settles USD into USDC at the peg", () => {
    const q = quotePayout(base);
    expect(format(q.settledUsdc)).toBe("1000.000000");
  });

  test("itemizes platform fee correctly (50bps of 1000 = 5.00)", () => {
    const q = quotePayout(base);
    expect(format(q.platformFee)).toBe("5.000000");
  });

  test("net = settled - fees - network", () => {
    const q = quotePayout(base);
    // 1000 - 5 (platform) - 0 (fx) - 0.01 (network) = 994.99
    expect(format(q.net)).toBe("994.990000");
  });

  test("fx spread applies after platform fee", () => {
    const q = quotePayout({ ...base, fxSpreadBps: 100 });
    // remainder after 5.00 platform = 995; 100bps = 9.95
    expect(format(q.fxSpread)).toBe("9.950000");
  });

  test("effective cost in bps reflects all-in take", () => {
    const q = quotePayout(base);
    // (5 + 0 + 0.01) / 1000 = 50.1 bps -> 50
    expect(q.effectiveCostBps).toBe(50);
  });

  test("instant vs batched settlement time", () => {
    expect(quotePayout(base).settlementSeconds).toBe(5);
    expect(quotePayout({ ...base, instant: false }).settlementSeconds).toBe(90);
  });

  test("rejects bad fee inputs", () => {
    expect(() => quotePayout({ ...base, platformFeeBps: -1 })).toThrow();
  });
});

describe("compareToBaseline", () => {
  test("beats an international wire on time", () => {
    const c = compareToBaseline(quotePayout(base), "intlWire");
    expect(c.label).toBe("International wire");
    expect(c.fasterBy).toContain("days");
  });
});

describe("humanizeSeconds", () => {
  test("formats ranges", () => {
    expect(humanizeSeconds(5)).toBe("5s");
    expect(humanizeSeconds(600)).toBe("10m");
    expect(humanizeSeconds(2 * 86_400)).toBe("2 days");
    expect(humanizeSeconds(0)).toBe("no faster");
  });
});

describe("settle (simulated)", () => {
  test("is deterministic per seed and always flagged simulated", () => {
    const q = quotePayout(base);
    const a = settle(q, 42);
    const b = settle(q, 42);
    expect(a).toEqual(b);
    expect(a.simulated).toBe(true);
    expect(a.txHash).toMatch(/^0x[0-9a-f]+$/);
    expect(a.id.startsWith("po_sim_")).toBe(true);
  });
});
