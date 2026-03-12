"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
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
import { createCard } from "@/actions/cards";

interface CreateCardDialogProps {
  deckId: string;
}

export function CreateCardDialog({ deckId }: CreateCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      await createCard({ deckId, front, back });
      setFront("");
      setBack("");
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Card
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Card</DialogTitle>
            <DialogDescription>
              Add a new flashcard to this deck.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="front">Front</Label>
              <Input
                id="front"
                placeholder="Question or prompt"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="back">Back</Label>
              <Input
                id="back"
                placeholder="Answer"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add Card"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
