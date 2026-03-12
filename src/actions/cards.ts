"use server";

import {
  insertCard,
  updateCard as updateCardQuery,
  deleteCard as deleteCardQuery,
} from "@/db/queries/cards";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const createCardSchema = z.object({
  deckId: z.string().uuid(),
  front: z.string().min(1, "Front is required").max(1000),
  back: z.string().min(1, "Back is required").max(1000),
});

type CreateCardInput = z.infer<typeof createCardSchema>;

export async function createCard(data: CreateCardInput) {
  const validated = createCardSchema.parse(data);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const card = await insertCard(
    validated.deckId,
    userId,
    validated.front,
    validated.back,
  );

  revalidatePath(`/decks/${validated.deckId}`);

  return card;
}

const updateCardSchema = z.object({
  cardId: z.string().uuid(),
  deckId: z.string().uuid(),
  front: z.string().min(1, "Front is required").max(1000),
  back: z.string().min(1, "Back is required").max(1000),
});

type UpdateCardInput = z.infer<typeof updateCardSchema>;

export async function updateCard(data: UpdateCardInput) {
  const validated = updateCardSchema.parse(data);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const card = await updateCardQuery(
    validated.cardId,
    userId,
    validated.front,
    validated.back,
  );

  revalidatePath(`/decks/${validated.deckId}`);

  return card;
}

const deleteCardSchema = z.object({
  cardId: z.string().uuid(),
  deckId: z.string().uuid(),
});

type DeleteCardInput = z.infer<typeof deleteCardSchema>;

export async function deleteCard(data: DeleteCardInput) {
  const validated = deleteCardSchema.parse(data);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await deleteCardQuery(validated.cardId, userId);

  revalidatePath(`/decks/${validated.deckId}`);
}
