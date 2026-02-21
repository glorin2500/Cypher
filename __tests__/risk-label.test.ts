/**
 * Risk label logic mirrors the logic in scanner-api.ts:
 *   score < 30  → safe
 *   score < 70  → warning
 *   score >= 70 → danger
 */
function getRiskLabel(score: number): "safe" | "warning" | "danger" {
    if (score < 30) return "safe";
    if (score < 70) return "warning";
    return "danger";
}

describe("getRiskLabel", () => {
    it("returns safe for score 0", () => expect(getRiskLabel(0)).toBe("safe"));
    it("returns safe for score 29", () => expect(getRiskLabel(29)).toBe("safe"));
    it("returns warning for score 30", () => expect(getRiskLabel(30)).toBe("warning"));
    it("returns warning for score 50", () => expect(getRiskLabel(50)).toBe("warning"));
    it("returns warning for score 69", () => expect(getRiskLabel(69)).toBe("warning"));
    it("returns danger for score 70", () => expect(getRiskLabel(70)).toBe("danger"));
    it("returns danger for score 100", () => expect(getRiskLabel(100)).toBe("danger"));
    it("returns danger for score above 100", () => expect(getRiskLabel(150)).toBe("danger"));
    it("returns safe for negative score", () => expect(getRiskLabel(-5)).toBe("safe"));
});
