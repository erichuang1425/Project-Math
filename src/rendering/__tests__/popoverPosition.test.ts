import { describe, expect, it } from "vitest";
import { computePopoverPosition } from "../popoverPosition";

const viewport = { width: 1024, height: 768 };
const popover = { width: 280, height: 120 };

describe("computePopoverPosition", () => {
  it("places the popover below the trigger when there is room", () => {
    const result = computePopoverPosition({ top: 100, bottom: 120, left: 200 }, popover, viewport);
    expect(result.placement).toBe("bottom");
    expect(result.top).toBe(126);
    expect(result.left).toBe(200);
  });

  it("flips above when below would overflow the viewport", () => {
    const result = computePopoverPosition({ top: 700, bottom: 720, left: 200 }, popover, viewport);
    expect(result.placement).toBe("top");
    expect(result.top).toBe(700 - popover.height - 6);
  });

  it("stays below (clamped) when neither orientation truly fits", () => {
    const result = computePopoverPosition({ top: 10, bottom: 720, left: 200 }, popover, viewport);
    expect(result.placement).toBe("bottom");
    expect(result.top).toBeGreaterThan(viewport.height - popover.height - 8);
  });

  it("clamps the popover against the left viewport edge", () => {
    const result = computePopoverPosition({ top: 100, bottom: 120, left: -50 }, popover, viewport);
    expect(result.left).toBe(8);
  });

  it("clamps the popover against the right viewport edge", () => {
    const result = computePopoverPosition({ top: 100, bottom: 120, left: 1200 }, popover, viewport);
    expect(result.left).toBe(viewport.width - popover.width - 8);
  });
});
