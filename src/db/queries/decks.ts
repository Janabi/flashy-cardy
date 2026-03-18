import { db } from "@/db";
import { decks, cards } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";

export async function getDecksByUserId(userId: string) {
  return db.query.decks.findMany({
    where: eq(decks.userId, userId),
    with: { cards: true },
  });
}

export async function getDeckCountByUserId(userId: string) {
  const [result] = await db
    .select({ count: count() })
    .from(decks)
    .where(eq(decks.userId, userId));
  return result?.count ?? 0;
}

export async function getDeckById(deckId: string, userId: string) {
  return db.query.decks.findFirst({
    where: and(eq(decks.id, deckId), eq(decks.userId, userId)),
    with: {
      cards: {
        orderBy: desc(cards.updatedAt),
      },
    },
  });
}

export async function insertDeck(
  userId: string,
  title: string,
  description?: string | null,
) {
  await db.insert(decks).values({ userId, title, description: description ?? null });
}

export async function updateDeck(
  deckId: string,
  userId: string,
  data: { title: string; description: string | null },
) {
  await db
    .update(decks)
    .set({ title: data.title, description: data.description })
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)));
}

export async function deleteDeck(deckId: string, userId: string) {
  await db
    .delete(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)));
}
