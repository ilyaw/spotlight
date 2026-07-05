import { useLayoutEffect, useRef, type RefObject } from "react";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { currentMonitor, getCurrentWindow } from "@tauri-apps/api/window";

const PANEL_WIDTH = 680;
const GLOW_BLEED = 16;
const WINDOW_WIDTH = PANEL_WIDTH + GLOW_BLEED * 2;
const SCREEN_MARGIN = 16;

async function resolveScreenMaxHeight(): Promise<number> {
  try {
    const monitor = await currentMonitor();
    if (!monitor) return 1200;

    const logicalWorkAreaHeight =
      monitor.workArea.size.height / monitor.scaleFactor;
    return Math.max(200, Math.floor(logicalWorkAreaHeight - SCREEN_MARGIN));
  } catch {
    return 1200;
  }
}

function measurePanelHeight(root: HTMLElement): number {
  // Full container height including glow bleed padding.
  return root.offsetHeight;
}

export function useWindowAutoHeight(
  deps: unknown[] = [],
): RefObject<HTMLDivElement | null> {
  const targetRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    let screenMaxHeight = 1200;
    let cancelled = false;
    let syncRaf = 0;

    const refreshScreenMax = async () => {
      screenMaxHeight = await resolveScreenMaxHeight();
      if (!cancelled) sync();
    };

    const sync = () => {
      cancelAnimationFrame(syncRaf);
      syncRaf = requestAnimationFrame(() => {
        if (!targetRef.current || cancelled) return;

        const height = Math.ceil(measurePanelHeight(targetRef.current));
        void getCurrentWindow().setSize(
          new LogicalSize(
            WINDOW_WIDTH,
            Math.min(Math.max(height, 80), screenMaxHeight),
          ),
        );
      });
    };

    void refreshScreenMax();

    const observed = new WeakSet<Element>();

    const observeTree = (node: Element) => {
      if (observed.has(node)) return;
      observed.add(node);
      resizeObserver.observe(node);
      for (const child of node.children) {
        observeTree(child);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      sync();
    });

    observeTree(el);

    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            observeTree(node);
          }
        }
      }
      sync();
    });
    mutationObserver.observe(el, { childList: true, subtree: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(syncRaf);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return targetRef;
}
