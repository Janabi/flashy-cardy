import { db } from "@/db";
import { cards, decks } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function insertCard(
  deckId: string,
  userId: string,
  front: string,
  back: string,
) {
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.id, deckId), eq(decks.userId, userId)),
  });

  if (!deck) throw new Error("Deck not found");

  const [card] = await db
    .insert(cards)
    .values({ deckId, front, back })
    .returning();

  return card;
}

export async function updateCard(
  cardId: string,
  userId: string,
  front: string,
  back: string,
) {
  const card = await db.query.cards.findFirst({
    where: eq(cards.id, cardId),
    with: { deck: true },
  });

  if (!card || card.deck.userId !== userId) throw new Error("Card not found");

  const [updated] = await db
    .update(cards)
    .set({ front, back, updatedAt: new Date() })
    .where(eq(cards.id, cardId))
    .returning();

  return updated;
}

export async function deleteCard(cardId: string, userId: string) {
  const card = await db.query.cards.findFirst({
    where: eq(cards.id, cardId),
    with: { deck: true },
  });

  if (!card || card.deck.userId !== userId) throw new Error("Card not found");

  await db.delete(cards).where(eq(cards.id, cardId));
}

export async function insertManyCards(
  deckId: string,
  userId: string,
  cardData: { front: string; back: string }[],
) {
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.id, deckId), eq(decks.userId, userId)),
  });

  if (!deck) throw new Error("Deck not found");

  await db
    .insert(cards)
    .values(cardData.map((c) => ({ deckId, front: c.front, back: c.back })));
}
