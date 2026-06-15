import { describe, expect, test } from "vitest";
import { applyFeeBps, format, pegConvert, usd, usdc } from "./stablecoin";

describe("money parsing", () => {
  test("parses USD cents exactly", () => {
    expect(usd("100.00").baseUnits).toBe(10_000n);
  });

  test("parses USDC 6dp exactly", () => {
    expect(usdc("100.000000").baseUnits).toBe(100_000_000n);
  });

  test("rejects too many decimals", () => {
    expect(() => usd("1.234")).toThrow(RangeError);
  });

  test("rejects garbage", () => {
    expect(() => usdc("abc")).toThrow(TypeError);
  });
});

describe("peg conversion", () => {
  test("USD -> USDC at 1:1 preserves value", () => {
    expect(format(pegConvert(usd("250.00")))).toBe("250.000000");
  });

  test("USDC -> USD at 1:1 preserves value", () => {
    expect(format(pegConvert(usdc("250.000000")))).toBe("250.00");
  });

  test("round trip is identity", () => {
    const start = usd("99.99");
    const round = pegConvert(pegConvert(start));
    expect(round.baseUnits).toBe(start.baseUnits);
  });
});

describe("fees", () => {
  test("30bps on 100 USDC = 0.30 fee", () => {
    const { net, fee } = applyFeeBps(usdc("100.000000"), 30);
    expect(format(fee)).toBe("0.300000");
    expect(format(net)).toBe("99.700000");
  });

  test("rejects out-of-range bps", () => {
    expect(() => applyFeeBps(usd("1.00"), 10_001)).toThrow(RangeError);
  });

  test("does not mutate input", () => {
    const m = usdc("100.000000");
    applyFeeBps(m, 50);
    expect(m.baseUnits).toBe(100_000_000n);
  });
});
