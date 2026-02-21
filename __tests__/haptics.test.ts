import { triggerHaptic } from "@/lib/haptics";

// Mock navigator.vibrate
beforeEach(() => {
    Object.defineProperty(navigator, "vibrate", {
        writable: true,
        value: jest.fn(),
    });
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe("triggerHaptic", () => {
    it("calls navigator.vibrate with a short pulse for 'light'", () => {
        triggerHaptic("light");
        expect(navigator.vibrate).toHaveBeenCalledWith(10);
    });

    it("calls navigator.vibrate with correct pattern for 'success'", () => {
        triggerHaptic("success");
        expect(navigator.vibrate).toHaveBeenCalledWith([10, 50, 10]);
    });

    it("calls navigator.vibrate with correct pattern for 'warning'", () => {
        triggerHaptic("warning");
        expect(navigator.vibrate).toHaveBeenCalledWith([20, 100, 20]);
    });

    it("calls navigator.vibrate with correct pattern for 'error'", () => {
        triggerHaptic("error");
        expect(navigator.vibrate).toHaveBeenCalledWith([30, 100, 30, 100, 30]);
    });

    it("does not throw when navigator.vibrate is not supported", () => {
        Object.defineProperty(navigator, "vibrate", {
            writable: true,
            value: undefined,
        });
        expect(() => triggerHaptic("success")).not.toThrow();
    });
});
