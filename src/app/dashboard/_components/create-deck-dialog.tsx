"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createDeckAction } from "@/actions/decks";

interface CreateDeckDialogProps {
  trigger?: React.ReactNode;
  canCreate?: boolean;
}

export function CreateDeckDialog({
  trigger,
  canCreate = true,
}: CreateDeckDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      await createDeckAction({
        title,
        description: description.trim() || undefined,
      });
      setTitle("");
      setDescription("");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button disabled={!canCreate}>
            <Plus className="mr-2 h-4 w-4" />
            New Deck
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        {canCreate ? (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>New Deck</DialogTitle>
              <DialogDescription>
                Create a new flashcard deck to start studying.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deck-title">Title</Label>
                <Input
                  id="deck-title"
                  placeholder="e.g. Spanish Vocabulary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deck-description">
                  Description{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="deck-description"
                  placeholder="What is this deck about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Create Deck"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Deck limit reached</DialogTitle>
              <DialogDescription>
                You&apos;ve reached the 3-deck limit on the free plan. Upgrade
                to Pro for unlimited decks.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6">
              <Button asChild>
                <Link href="/pricing">View Plans</Link>
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
