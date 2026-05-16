import { describe, expect, it, vi } from "vitest";
import {
  dispatchMenuEvent,
  getTauriEventListener,
  subscribeToMenuEvents,
  type MenuEventHandlers,
  type TauriEventListener,
  type TauriMenuEventUnlisten
} from "./tauriMenu";

function makeHandlers(): MenuEventHandlers & {
  calls: Array<{ name: string; arg?: string }>;
} {
  const calls: Array<{ name: string; arg?: string }> = [];
  return {
    calls,
    onToggleMode: () => calls.push({ name: "toggle-mode" }),
    onToggleLowGlare: () => calls.push({ name: "toggle-low-glare" }),
    onSetTextSize: (size) => calls.push({ name: "set-text-size", arg: size }),
    onSetLineSpacing: (spacing) => calls.push({ name: "set-line-spacing", arg: spacing }),
    onSetFont: (font) => calls.push({ name: "set-font", arg: font }),
    onOpenShortcuts: () => calls.push({ name: "open-shortcuts" }),
    onGoToDashboard: () => calls.push({ name: "go-to-dashboard" }),
    onExportSummary: () => calls.push({ name: "export-summary" })
  };
}

describe("dispatchMenuEvent", () => {
  it("routes each menu event id to the matching handler", () => {
    const handlers = makeHandlers();

    const events = [
      "menu:toggle-mode",
      "menu:toggle-low-glare",
      "menu:text-size:standard",
      "menu:text-size:large",
      "menu:text-size:extra-large",
      "menu:line-spacing:standard",
      "menu:line-spacing:comfortable",
      "menu:line-spacing:wide",
      "menu:font:sans",
      "menu:font:serif",
      "menu:shortcuts",
      "menu:go-to-dashboard",
      "menu:export-summary"
    ];

    for (const id of events) {
      expect(dispatchMenuEvent(id, handlers)).toBe(true);
    }

    expect(handlers.calls).toEqual([
      { name: "toggle-mode" },
      { name: "toggle-low-glare" },
      { name: "set-text-size", arg: "standard" },
      { name: "set-text-size", arg: "large" },
      { name: "set-text-size", arg: "extra-large" },
      { name: "set-line-spacing", arg: "standard" },
      { name: "set-line-spacing", arg: "comfortable" },
      { name: "set-line-spacing", arg: "wide" },
      { name: "set-font", arg: "sans" },
      { name: "set-font", arg: "serif" },
      { name: "open-shortcuts" },
      { name: "go-to-dashboard" },
      { name: "export-summary" }
    ]);
  });

  it("returns false for unknown ids and does not call any handler", () => {
    const handlers = makeHandlers();
    expect(dispatchMenuEvent("menu:unknown", handlers)).toBe(false);
    expect(dispatchMenuEvent("some-other-event", handlers)).toBe(false);
    expect(handlers.calls).toEqual([]);
  });
});

describe("getTauriEventListener", () => {
  it("returns undefined when the Tauri global is missing", () => {
    expect(getTauriEventListener({} as Window)).toBeUndefined();
  });

  it("returns the listener from window.__TAURI__.event.listen when present", () => {
    const listen = vi.fn();
    const win = { __TAURI__: { event: { listen } } } as unknown as Window;
    expect(getTauriEventListener(win)).toBe(listen);
  });
});

describe("subscribeToMenuEvents", () => {
  it("registers a listener on the 'menu' channel and dispatches payloads", async () => {
    const handlers = makeHandlers();
    let captured: ((event: { payload: string }) => void) | undefined;
    const unlisten = vi.fn();
    const listener: TauriEventListener = (event, handler) => {
      expect(event).toBe("menu");
      captured = handler;
      return Promise.resolve(unlisten as TauriMenuEventUnlisten);
    };

    const returnedUnlisten = await subscribeToMenuEvents(handlers, listener);
    expect(returnedUnlisten).toBe(unlisten);
    expect(captured).toBeDefined();

    captured?.({ payload: "menu:toggle-mode" });
    captured?.({ payload: "menu:font:serif" });

    expect(handlers.calls).toEqual([{ name: "toggle-mode" }, { name: "set-font", arg: "serif" }]);
  });
});
