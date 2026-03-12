import { getDeckById } from "@/db/queries/decks";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StudyCards } from "./_components/study-cards";

export default async function StudyPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { deckId } = await params;
  const deck = await getDeckById(deckId, userId);
  if (!deck) notFound();

  if (deck.cards.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/decks/${deckId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Deck
            </Link>
          </Button>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="mb-2 text-lg font-medium">No cards to study</p>
            <p className="mb-4 text-muted-foreground">
              Add some cards to &ldquo;{deck.title}&rdquo; before starting a study session.
            </p>
            <Button asChild>
              <Link href={`/decks/${deckId}`}>Go Back &amp; Add Cards</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/decks/${deckId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Deck
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Study: {deck.title}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {deck.cards.length} {deck.cards.length === 1 ? "card" : "cards"} to review
        </p>
      </div>

      <StudyCards
        cards={deck.cards.map((c) => ({ id: c.id, front: c.front, back: c.back }))}
        deckTitle={deck.title}
        deckId={deckId}
      />
    </div>
  );
}
