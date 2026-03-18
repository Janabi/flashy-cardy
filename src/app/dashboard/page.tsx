import { getDecksByUserId } from "@/db/queries/decks";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Crown, Plus } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CreateDeckDialog } from "./_components/create-deck-dialog";

const FREE_DECK_LIMIT = 3;

export default async function DashboardPage() {
  const { userId, has } = await auth();
  if (!userId) redirect("/");

  const userDecks = await getDecksByUserId(userId);
  const hasUnlimitedDecks = has({ feature: "unlimited_decks" });
  const canCreateDeck = hasUnlimitedDecks || userDecks.length < FREE_DECK_LIMIT;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Decks</h1>
          <p className="mt-1 text-muted-foreground">
            Create and manage your flashcard decks
          </p>
          {!hasUnlimitedDecks && (
            <p className="mt-1 text-sm text-muted-foreground">
              {userDecks.length} / {FREE_DECK_LIMIT} decks used
            </p>
          )}
        </div>
        <CreateDeckDialog canCreate={canCreateDeck} />
      </div>

      {!hasUnlimitedDecks && !canCreateDeck && (
        <Card className="mb-8 border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Deck limit reached</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                You&apos;ve used all {FREE_DECK_LIMIT} decks on the free plan.
                Upgrade to Pro for unlimited decks and AI flashcard generation.
              </p>
              <div className="max-w-xs space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{userDecks.length} of {FREE_DECK_LIMIT} decks</span>
                  <span>100%</span>
                </div>
                <Progress value={100} />
              </div>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link href="/pricing">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {userDecks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="mb-4 text-muted-foreground">
              You don&apos;t have any decks yet.
            </p>
            <CreateDeckDialog
              canCreate={canCreateDeck}
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first deck
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userDecks.map((deck) => (
            <Link key={deck.id} href={`/decks/${deck.id}`}>
              <Card className="transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle>{deck.title}</CardTitle>
                  <CardDescription>
                    {deck.description ?? "No description"}
                    <span className="mt-2 block text-xs">
                      {deck.cards.length}{" "}
                      {deck.cards.length === 1 ? "card" : "cards"}
                    </span>
                  </CardDescription>
                </CardHeader>
                <div className="px-6 pb-4 pt-1 text-xs text-muted-foreground">
                  Last updated:{" "}
                  {deck.updatedAt
                    ? new Date(deck.updatedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "-"}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
