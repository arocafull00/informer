export function getIncompleteItemIds(
  itemIds: readonly string[],
  answers: Record<string, number | undefined>
): string[] {
  return itemIds.filter((id) => answers[id] === undefined);
}

export function resolveIncompleteNavigationTarget(
  incompleteIds: readonly string[],
  currentRef: string | null,
  direction: "next" | "previous"
): string | null {
  if (incompleteIds.length === 0) return null;

  if (currentRef === null) {
    return direction === "next"
      ? incompleteIds[0]
      : incompleteIds[incompleteIds.length - 1];
  }

  const currentIndex = incompleteIds.indexOf(currentRef);
  if (currentIndex === -1) {
    return direction === "next"
      ? incompleteIds[0]
      : incompleteIds[incompleteIds.length - 1];
  }

  if (direction === "next") {
    return incompleteIds[(currentIndex + 1) % incompleteIds.length];
  }

  return incompleteIds[
    (currentIndex - 1 + incompleteIds.length) % incompleteIds.length
  ];
}

export function focusNavigationTarget(
  target: HTMLElement | null
): void {
  if (!target) return;

  target.scrollIntoView({ behavior: "smooth", block: "center" });

  const focusable =
    target.matches("button, input, textarea, select, [tabindex]")
      ? target
      : target.querySelector<HTMLElement>(
          "button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])"
        );

  focusable?.focus({ preventScroll: true });
}
