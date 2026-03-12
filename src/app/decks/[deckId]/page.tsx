import { getDeckById } from "@/db/queries/decks";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreateCardDialog } from "./_components/create-card-dialog";
import { EditCardDialog } from "./_components/edit-card-dialog";
import { EditDeckDialog } from "./_components/edit-deck-dialog";
import { DeleteCardDialog } from "./_components/delete-card-dialog";
import { DeleteDeckDialog } from "./_components/delete-deck-dialog";

export default async function DeckPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { deckId } = await params;
  const deck = await getDeckById(deckId, userId);
  if (!deck) notFound();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Decks
          </Link>
        </Button>
      </div>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{deck.title}</h1>
            <Badge variant="secondary">
              {deck.cards.length} {deck.cards.length === 1 ? "card" : "cards"}
            </Badge>
          </div>
          {deck.description && (
            <p className="mt-2 text-muted-foreground">{deck.description}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            Created{" "}
            {new Date(deck.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EditDeckDialog
            deckId={deck.id}
            currentTitle={deck.title}
            currentDescription={deck.description}
          />
          <DeleteDeckDialog deckId={deck.id} cardCount={deck.cards.length} />
        </div>
      </div>

      {deck.cards.length > 0 && (
        <div className="mb-8">
          <Button asChild>
            <Link href={`/decks/${deck.id}/study`}>
              <BookOpen className="mr-2 h-4 w-4" />
              Study Deck
            </Link>
          </Button>
        </div>
      )}

      <Separator className="mb-8" />

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Cards</h2>
        <CreateCardDialog deckId={deck.id} />
      </div>

      {deck.cards.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="mb-4 text-muted-foreground">
              This deck doesn&apos;t have any cards yet.
            </p>
            <CreateCardDialog deckId={deck.id} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {deck.cards.map((card, index) => (
            <Card key={card.id}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                  Card {index + 1}
                  <div className="flex items-center gap-1">
                    <EditCardDialog
                      cardId={card.id}
                      deckId={deck.id}
                      currentFront={card.front}
                      currentBack={card.back}
                    />
                    <DeleteCardDialog
                      cardId={card.id}
                      deckId={deck.id}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Front
                  </p>
                  <p className="mt-1">{card.front}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Back
                  </p>
                  <p className="mt-1">{card.back}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
