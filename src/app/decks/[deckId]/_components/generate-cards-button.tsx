"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { generateCardsWithAI } from "@/actions/cards";

interface GenerateCardsButtonProps {
  deckId: string;
  title: string;
  description?: string | null;
  hasAIFeature: boolean;
}

export function GenerateCardsButton({
  deckId,
  title,
  description,
  hasAIFeature,
}: GenerateCardsButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const hasDescription = Boolean(description?.trim());

  const noDescriptionTooltip = (
    <TooltipContent className="max-w-xs">
      <p>
        Add a deck description first—AI uses it to know what topic to create
        flashcards for. Edit your deck to add one.
      </p>
    </TooltipContent>
  );

  if (!hasDescription) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex cursor-not-allowed">
            <Button
              variant="outline"
              disabled
              className="pointer-events-none"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate with AI
            </Button>
          </span>
        </TooltipTrigger>
        {noDescriptionTooltip}
      </Tooltip>
    );
  }

  if (!hasAIFeature) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            onClick={() => router.push("/pricing")}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Generate with AI
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>This is a Pro feature. Click to view pricing.</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      try {
        await generateCardsWithAI({
          deckId,
          title,
          description: description ?? undefined,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        onClick={handleGenerate}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        {isPending ? "Generating..." : "Generate with AI"}
      </Button>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
