import { describe, expect, it } from "vitest";
import { calculateMatchScore } from "@/lib/scoring/matchScore";

describe("calculateMatchScore", () => {
  it("scores exact keyword overlap highly", () => {
    expect(
      calculateMatchScore(
        "iPhone 16 256G 黑色",
        "Apple iPhone 16 256G 黑色 官方正品"
      )
    ).toBeGreaterThanOrEqual(80);
  });

  it("scores unrelated products low", () => {
    expect(calculateMatchScore("iPhone 16 256G", "小米空气净化器滤芯")).toBeLessThan(30);
  });
});
