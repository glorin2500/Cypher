import { parseUPIString, buildUPIDeepLink } from "@/lib/upi-handler";

describe("parseUPIString", () => {
    it("parses a full upi:// deep link", () => {
        const result = parseUPIString("upi://pay?pa=merchant@upi&pn=Test%20Merchant&am=100&cu=INR");
        expect(result).not.toBeNull();
        expect(result!.pa).toBe("merchant@upi");
        expect(result!.pn).toBe("Test Merchant");
        expect(result!.am).toBe("100");
        expect(result!.cu).toBe("INR");
    });

    it("returns null when pa is missing", () => {
        const result = parseUPIString("upi://pay?pn=SomeMerchant");
        expect(result).toBeNull();
    });

    it("parses without upi:// prefix", () => {
        const result = parseUPIString("pay?pa=test@paytm");
        expect(result).not.toBeNull();
        expect(result!.pa).toBe("test@paytm");
    });

    it("handles malformed strings gracefully", () => {
        const result = parseUPIString("not-a-upi-string-at-all");
        // Returns null because pa is empty
        expect(result).toBeNull();
    });
});

describe("buildUPIDeepLink", () => {
    it("builds a valid deep link with all params", () => {
        const link = buildUPIDeepLink({ pa: "merchant@upi", pn: "Shop", am: "99.50", cu: "INR" });
        expect(link).toMatch(/^upi:\/\/pay\?/);
        expect(link).toContain("pa=merchant%40upi");
        expect(link).toContain("cu=INR");
        expect(link).toContain("am=99.50");
    });

    it("always includes cu=INR by default", () => {
        const link = buildUPIDeepLink({ pa: "a@b" });
        expect(link).toContain("cu=INR");
    });

    it("throws when UPI ID has no @", () => {
        expect(() => buildUPIDeepLink({ pa: "invalid-upi" })).toThrow("Invalid UPI ID format");
    });

    it("throws when amount is negative", () => {
        expect(() => buildUPIDeepLink({ pa: "a@b", am: "-50" })).toThrow("Invalid amount");
    });

    it("throws when amount is zero", () => {
        expect(() => buildUPIDeepLink({ pa: "a@b", am: "0" })).toThrow("Invalid amount");
    });
});
