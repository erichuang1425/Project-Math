import type { ReaderFont, ReaderLineSpacing, ReaderTextSize } from "./readerSettings";

export const MENU_EVENT_CHANNEL = "menu";

export type MenuEventHandlers = {
  onToggleMode: () => void;
  onToggleLowGlare: () => void;
  onSetTextSize: (size: ReaderTextSize) => void;
  onSetLineSpacing: (spacing: ReaderLineSpacing) => void;
  onSetFont: (font: ReaderFont) => void;
  onOpenShortcuts: () => void;
  onGoToDashboard: () => void;
  onExportSummary: () => void;
};

export type TauriMenuEventUnlisten = () => void;

type TauriMenuEvent = { payload: string };

export type TauriEventListener = (
  event: string,
  handler: (event: TauriMenuEvent) => void
) => Promise<TauriMenuEventUnlisten>;

type TauriEventWindow = Window & {
  __TAURI__?: {
    event?: {
      listen?: TauriEventListener;
    };
  };
};

export function getTauriEventListener(
  win: Window | undefined = typeof window === "undefined" ? undefined : window
): TauriEventListener | undefined {
  if (!win) return undefined;
  return (win as TauriEventWindow).__TAURI__?.event?.listen;
}

export function dispatchMenuEvent(eventId: string, handlers: MenuEventHandlers): boolean {
  switch (eventId) {
    case "menu:toggle-mode":
      handlers.onToggleMode();
      return true;
    case "menu:toggle-low-glare":
      handlers.onToggleLowGlare();
      return true;
    case "menu:text-size:standard":
      handlers.onSetTextSize("standard");
      return true;
    case "menu:text-size:large":
      handlers.onSetTextSize("large");
      return true;
    case "menu:text-size:extra-large":
      handlers.onSetTextSize("extra-large");
      return true;
    case "menu:line-spacing:standard":
      handlers.onSetLineSpacing("standard");
      return true;
    case "menu:line-spacing:comfortable":
      handlers.onSetLineSpacing("comfortable");
      return true;
    case "menu:line-spacing:wide":
      handlers.onSetLineSpacing("wide");
      return true;
    case "menu:font:sans":
      handlers.onSetFont("sans");
      return true;
    case "menu:font:serif":
      handlers.onSetFont("serif");
      return true;
    case "menu:shortcuts":
      handlers.onOpenShortcuts();
      return true;
    case "menu:go-to-dashboard":
      handlers.onGoToDashboard();
      return true;
    case "menu:export-summary":
      handlers.onExportSummary();
      return true;
    default:
      return false;
  }
}

export async function subscribeToMenuEvents(
  handlers: MenuEventHandlers,
  listener: TauriEventListener
): Promise<TauriMenuEventUnlisten> {
  return listener(MENU_EVENT_CHANNEL, (event) => {
    dispatchMenuEvent(event.payload, handlers);
  });
}
