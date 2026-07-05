import { useLayoutEffect, useRef, type RefObject } from "react";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { currentMonitor, getCurrentWindow } from "@tauri-apps/api/window";

const WINDOW_WIDTH = 680;
const BOTTOM_PADDING = 12;
const MAX_WINDOW_HEIGHT = 800;
const SCREEN_MARGIN = 16;

async function resolveMaxWindowHeight(): Promise<number> {
  try {
    const monitor = await currentMonitor();
    if (!monitor) return MAX_WINDOW_HEIGHT;

    const logicalWorkAreaHeight =
      monitor.workArea.size.height / monitor.scaleFactor;
    return Math.min(
      MAX_WINDOW_HEIGHT,
      Math.max(80, Math.floor(logicalWorkAreaHeight - SCREEN_MARGIN)),
    );
  } catch {
    return MAX_WINDOW_HEIGHT;
  }
}

export function useWindowAutoHeight(
  deps: unknown[] = [],
): RefObject<HTMLDivElement | null> {
  const targetRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    let maxHeight = MAX_WINDOW_HEIGHT;
    let cancelled = false;

    const refreshMaxHeight = async () => {
      maxHeight = await resolveMaxWindowHeight();
      if (!cancelled) sync();
    };

    const sync = () => {
      requestAnimationFrame(() => {
        if (!targetRef.current) return;

        const height = Math.ceil(
          targetRef.current.getBoundingClientRect().bottom + BOTTOM_PADDING,
        );
        void getCurrentWindow().setSize(
          new LogicalSize(
            WINDOW_WIDTH,
            Math.min(Math.max(height, 80), maxHeight),
          ),
        );
      });
    };

    void refreshMaxHeight();

    const observer = new ResizeObserver(() => {
      sync();
    });
    observer.observe(el);

    const observeDescendants = (root: Element) => {
      for (const child of root.children) {
        observer.observe(child);
      }
    };
    observeDescendants(el);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return targetRef;
}
