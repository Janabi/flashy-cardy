"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
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
import { updateCard } from "@/actions/cards";

interface EditCardDialogProps {
  cardId: string;
  deckId: string;
  currentFront: string;
  currentBack: string;
}

export function EditCardDialog({
  cardId,
  deckId,
  currentFront,
  currentBack,
}: EditCardDialogProps) {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState(currentFront);
  const [back, setBack] = useState(currentBack);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setFront(currentFront);
      setBack(currentBack);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      await updateCard({ cardId, deckId, front, back });
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Pencil className="h-3.5 w-3.5" />
          <span className="sr-only">Edit card</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>
              Update the front and back of this flashcard.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-front">Front</Label>
              <Input
                id="edit-front"
                placeholder="Question or prompt"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                required
                maxLength={1000}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-back">Back</Label>
              <Input
                id="edit-back"
                placeholder="Answer"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                required
                maxLength={1000}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
