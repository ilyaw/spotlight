import { useLayoutEffect, useRef, type RefObject } from "react";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { getCurrentWindow } from "@tauri-apps/api/window";

const WINDOW_WIDTH = 680;
const BOTTOM_PADDING = 12;
const MAX_WINDOW_HEIGHT = 800;

export function useWindowAutoHeight(
  deps: unknown[] = [],
): RefObject<HTMLDivElement | null> {
  const targetRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const sync = () => {
      requestAnimationFrame(() => {
        const height = Math.ceil(
          el.getBoundingClientRect().bottom + BOTTOM_PADDING,
        );
        void getCurrentWindow().setSize(
          new LogicalSize(
            WINDOW_WIDTH,
            Math.min(Math.max(height, 80), MAX_WINDOW_HEIGHT),
          ),
        );
      });
    };

    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(el);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return targetRef;
}
