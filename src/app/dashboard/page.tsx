import { getDecksByUserId } from "@/db/queries/decks";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateDeckDialog } from "./_components/create-deck-dialog";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const userDecks = await getDecksByUserId(userId);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Decks</h1>
          <p className="mt-1 text-muted-foreground">
            Create and manage your flashcard decks
          </p>
        </div>
        <CreateDeckDialog />
      </div>

      {userDecks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="mb-4 text-muted-foreground">
              You don&apos;t have any decks yet.
            </p>
            <CreateDeckDialog
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
