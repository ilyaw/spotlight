import { useCallback, useMemo, useState } from "react";
import { mockItems, type SpotlightItem } from "../data/mockItems";

export function useSpotlightSearch() {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return mockItems;

    return mockItems.filter((item) => {
      const haystack = [
        item.title,
        item.subtitle,
        item.category,
        ...(item.keywords ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalized);
    });
  }, [query]);

  const clampIndex = useCallback(
    (index: number) => {
      if (results.length === 0) return 0;
      return Math.max(0, Math.min(index, results.length - 1));
    },
    [results.length],
  );

  const selectNext = useCallback(() => {
    setSelectedIndex((current) => clampIndex(current + 1));
  }, [clampIndex]);

  const selectPrevious = useCallback(() => {
    setSelectedIndex((current) => clampIndex(current - 1));
  }, [clampIndex]);

  const resetSelection = useCallback(() => {
    setSelectedIndex(0);
  }, []);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      setSelectedIndex(0);
    },
    [],
  );

  const getSelectedItem = useCallback((): SpotlightItem | null => {
    return results[selectedIndex] ?? null;
  }, [results, selectedIndex]);

  return {
    query,
    setQuery: handleQueryChange,
    results,
    selectedIndex,
    setSelectedIndex,
    selectNext,
    selectPrevious,
    resetSelection,
    getSelectedItem,
  };
}
