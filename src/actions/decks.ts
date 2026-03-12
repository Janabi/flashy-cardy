"use server";

import { insertDeck, updateDeck, deleteDeck } from "@/db/queries/decks";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const createDeckSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
});

type CreateDeckInput = z.infer<typeof createDeckSchema>;

export async function createDeckAction(data: CreateDeckInput) {
  const validated = createDeckSchema.parse(data);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await insertDeck(userId, validated.title, validated.description?.trim() || null);

  revalidatePath("/dashboard");
}

const updateDeckSchema = z.object({
  deckId: z.string().uuid(),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
});

type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

export async function updateDeckAction(data: UpdateDeckInput) {
  const validated = updateDeckSchema.parse(data);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await updateDeck(validated.deckId, userId, {
    title: validated.title,
    description: validated.description?.trim() || null,
  });

  revalidatePath(`/decks/${validated.deckId}`);
}

const deleteDeckSchema = z.object({
  deckId: z.string().uuid(),
});

type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;

export async function deleteDeckAction(data: DeleteDeckInput) {
  const validated = deleteDeckSchema.parse(data);
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await deleteDeck(validated.deckId, userId);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
