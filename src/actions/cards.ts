"use server";

import {
  insertCard,
  insertManyCards,
  updateCard as updateCardQuery,
  deleteCard as deleteCardQuery,
} from "@/db/queries/cards";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

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

const generateCardsSchema = z.object({
  deckId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
});

type GenerateCardsInput = z.infer<typeof generateCardsSchema>;

const aiOutputSchema = z.object({
  cards: z.array(
    z.object({ front: z.string(), back: z.string() }),
  ),
});

export async function generateCardsWithAI(data: GenerateCardsInput) {
  const validated = generateCardsSchema.parse(data);
  const { userId, has } = await auth();
  if (!userId) throw new Error("Unauthorized");

  if (!has({ feature: "ai_flashcard_generation" })) {
    throw new Error(
      "AI flashcard generation requires a Pro subscription.",
    );
  }

  const topicContext = validated.description
    ? `"${validated.title}" — ${validated.description}`
    : `"${validated.title}"`;

  const modelId =
    process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-20250514";

  let generated: z.infer<typeof aiOutputSchema>;
  try {
    const { output } = await generateText({
      model: anthropic(modelId),
      output: Output.object({
        name: "FlashcardDeck",
        description:
          "A set of study flashcards with front (question) and back (answer).",
        schema: aiOutputSchema,
      }),
      prompt: `Generate exactly 20 high-quality flashcards for a study deck about ${topicContext}. Each card should have a clear, concise question or prompt on the front and a comprehensive answer on the back. Cover the topic thoroughly with varied difficulty levels.`,
    });
    generated = output!;
  } catch (err) {
    if (NoObjectGeneratedError.isInstance(err)) {
      throw new Error(
        "AI could not produce valid flashcards. Try a shorter topic or try again.",
      );
    }
    throw err;
  }

  if (!generated?.cards?.length) {
    throw new Error("AI failed to generate cards. Please try again.");
  }

  await insertManyCards(validated.deckId, userId, generated.cards);

  revalidatePath(`/decks/${validated.deckId}`);

  return { count: generated.cards.length };
}
