import type { Card } from "@/types/board";

export const POSITION_GAP = 1024;

export function sortCardsByPosition(cards: Card[]): Card[] {
  return [...cards].sort((a, b) => a.position - b.position);
}

/**
 * Calculates a position integer for dropping a card at targetIndex
 * within a sorted list (gap-based ordering, matches backend strategy).
 */
export function calculateDropPosition(
  sortedCards: Card[],
  targetIndex: number,
  excludeCardId?: string,
): number {
  const cards = excludeCardId
    ? sortedCards.filter((card) => card.id !== excludeCardId)
    : sortedCards;

  if (cards.length === 0) {
    return POSITION_GAP;
  }

  if (targetIndex <= 0) {
    const firstPosition = cards[0].position;
    return Math.max(Math.floor(firstPosition / 2), 1);
  }

  if (targetIndex >= cards.length) {
    return cards[cards.length - 1].position + POSITION_GAP;
  }

  const previous = cards[targetIndex - 1].position;
  const next = cards[targetIndex].position;
  return Math.floor((previous + next) / 2);
}
