export interface PopoverPositionInput {
  width: number;
  height: number;
}

export interface PopoverViewport {
  width: number;
  height: number;
}

export interface PopoverPosition {
  top: number;
  left: number;
  placement: "top" | "bottom";
}

const GAP = 6;
const EDGE = 8;

export function computePopoverPosition(
  triggerRect: { top: number; bottom: number; left: number },
  popover: PopoverPositionInput,
  viewport: PopoverViewport
): PopoverPosition {
  const belowTop = triggerRect.bottom + GAP;
  const aboveTop = triggerRect.top - popover.height - GAP;

  const fitsBelow = belowTop + popover.height <= viewport.height - EDGE;
  const fitsAbove = aboveTop >= EDGE;

  let placement: "top" | "bottom" = "bottom";
  let top = belowTop;
  if (!fitsBelow && fitsAbove) {
    placement = "top";
    top = aboveTop;
  }

  const maxLeft = viewport.width - popover.width - EDGE;
  const left = Math.max(EDGE, Math.min(triggerRect.left, Math.max(EDGE, maxLeft)));

  return { top, left, placement };
}
