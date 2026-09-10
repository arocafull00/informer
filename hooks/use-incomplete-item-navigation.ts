"use client";

import { useCallback, useMemo, useRef } from "react";
import {
  focusNavigationTarget,
  getIncompleteItemIds,
  resolveIncompleteNavigationTarget,
} from "@/lib/incomplete-item-navigation";

type UseIncompleteItemNavigationOptions = {
  itemIds: readonly string[];
  answers: Record<string, number | undefined>;
  resolveFocusTarget: (itemId: string) => HTMLElement | null;
  disabled?: boolean;
};

export function useIncompleteItemNavigation({
  itemIds,
  answers,
  resolveFocusTarget,
  disabled = false,
}: UseIncompleteItemNavigationOptions) {
  const lastVisitedIdRef = useRef<string | null>(null);

  const incompleteIds = useMemo(
    () => getIncompleteItemIds(itemIds, answers),
    [itemIds, answers]
  );

  const canNavigate = !disabled && incompleteIds.length > 0;

  const navigate = useCallback(
    (direction: "next" | "previous") => {
      if (!canNavigate) return;

      const targetId = resolveIncompleteNavigationTarget(
        incompleteIds,
        lastVisitedIdRef.current,
        direction
      );

      if (!targetId) return;

      lastVisitedIdRef.current = targetId;
      focusNavigationTarget(resolveFocusTarget(targetId));
    },
    [canNavigate, incompleteIds, resolveFocusTarget]
  );

  const navigateNext = useCallback(() => {
    navigate("next");
  }, [navigate]);

  const navigatePrevious = useCallback(() => {
    navigate("previous");
  }, [navigate]);

  return {
    canNavigate,
    navigateNext,
    navigatePrevious,
  };
}
