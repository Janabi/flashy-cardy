"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  RotateCcw,
  Shuffle,
  Trophy,
  X,
  Check,
  CircleCheck,
  CircleX,
} from "lucide-react";

interface StudyCard {
  id: string;
  front: string;
  back: string;
}

interface QuizRound {
  question: string;
  displayedAnswer: string;
  correctAnswer: string;
  showsCorrectAnswer: boolean;
}

interface StudyCardsProps {
  cards: StudyCard[];
  deckTitle: string;
  deckId: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function buildQuizRounds(orderedCards: StudyCard[], allCards: StudyCard[]): QuizRound[] {
  return orderedCards.map((card) => {
    const otherCards = allCards.filter((c) => c.id !== card.id);
    const showCorrect = otherCards.length === 0 || Math.random() < 0.5;

    if (showCorrect) {
      return {
        question: card.front,
        displayedAnswer: card.back,
        correctAnswer: card.back,
        showsCorrectAnswer: true,
      };
    }

    const decoy = otherCards[Math.floor(Math.random() * otherCards.length)];
    return {
      question: card.front,
      displayedAnswer: decoy.back,
      correctAnswer: card.back,
      showsCorrectAnswer: false,
    };
  });
}

export function StudyCards({ cards, deckTitle, deckId }: StudyCardsProps) {
  const [studyCards, setStudyCards] = useState(cards);
  const [rounds, setRounds] = useState<QuizRound[]>(() =>
    buildQuizRounds(cards, cards),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

  const round = rounds[currentIndex];
  const progress = ((currentIndex + (completed ? 1 : 0)) / rounds.length) * 100;
  const scorePercent = completed
    ? Math.round((correctCount / rounds.length) * 100)
    : 0;

  const flip = useCallback(() => {
    if (!answered) {
      setIsFlipped((prev) => !prev);
    }
  }, [answered]);

  const judge = useCallback(
    (userSaysCorrect: boolean) => {
      if (!isFlipped || answered) return;
      const isRight = userSaysCorrect === round.showsCorrectAnswer;
      setAnswered(true);
      setLastAnswerCorrect(isRight);
      if (isRight) {
        setCorrectCount((prev) => prev + 1);
      } else {
        setIncorrectCount((prev) => prev + 1);
      }
    },
    [isFlipped, answered, round],
  );

  const advance = useCallback(() => {
    if (!answered) return;
    if (currentIndex < rounds.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setAnswered(false);
      setLastAnswerCorrect(null);
    } else {
      setCompleted(true);
    }
  }, [answered, currentIndex, rounds.length]);

  const resetState = useCallback(
    (newCards: StudyCard[]) => {
      setStudyCards(newCards);
      setRounds(buildQuizRounds(newCards, cards));
      setCurrentIndex(0);
      setIsFlipped(false);
      setCompleted(false);
      setCorrectCount(0);
      setIncorrectCount(0);
      setAnswered(false);
      setLastAnswerCorrect(null);
    },
    [cards],
  );

  const restart = useCallback(() => resetState(studyCards), [resetState, studyCards]);
  const shuffle = useCallback(
    () => resetState(shuffleArray(cards)),
    [resetState, cards],
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (completed) return;

      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (answered) {
          advance();
        } else {
          flip();
        }
      } else if (e.key === "ArrowRight" && isFlipped && !answered) {
        e.preventDefault();
        judge(true);
      } else if (e.key === "ArrowLeft" && isFlipped && !answered) {
        e.preventDefault();
        judge(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [flip, advance, judge, isFlipped, answered, completed]);

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Trophy className="h-10 w-10 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">Quiz Complete!</h2>
          <p className="mt-2 text-muted-foreground">
            You scored {correctCount} out of {rounds.length} in &ldquo;{deckTitle}&rdquo;.
          </p>
        </div>

        <Card className="w-full max-w-xs">
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="text-center">
              <p className="text-4xl font-bold">{scorePercent}%</p>
              <p className="text-sm text-muted-foreground">Score</p>
            </div>
            <Separator />
            <div className="flex items-center justify-around">
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CircleCheck className="h-5 w-5" />
                  <span className="text-2xl font-bold">{correctCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <Separator orientation="vertical" className="h-10" />
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                  <CircleX className="h-5 w-5" />
                  <span className="text-2xl font-bold">{incorrectCount}</span>
                </div>
                <p className="text-xs text-muted-foreground">Incorrect</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={restart}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Restart
          </Button>
          <Button variant="outline" onClick={shuffle}>
            <Shuffle className="mr-2 h-4 w-4" />
            Shuffle &amp; Restart
          </Button>
          <Button asChild>
            <a href={`/decks/${deckId}`}>Back to Deck</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {rounds.length}
          </p>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="gap-1 text-emerald-600 dark:text-emerald-400">
              <Check className="h-3 w-3" />
              {correctCount}
            </Badge>
            <Badge variant="outline" className="gap-1 text-red-600 dark:text-red-400">
              <X className="h-3 w-3" />
              {incorrectCount}
            </Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={shuffle}>
          <Shuffle className="mr-2 h-4 w-4" />
          Shuffle
        </Button>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="perspective-[1200px]">
        <button
          type="button"
          onClick={flip}
          className="relative h-80 w-full cursor-pointer [transform-style:preserve-3d] transition-transform duration-500"
          style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          aria-label={isFlipped ? "Showing answer, click to show question" : "Showing question, click to show answer"}
        >
          <Card className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden]">
            <CardContent className="flex h-full w-full flex-col items-center justify-center p-8">
              <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Question
              </p>
              <p className="text-center text-xl font-medium leading-relaxed">
                {round.question}
              </p>
            </CardContent>
          </Card>

          <Card className="absolute inset-0 flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <CardContent className="flex h-full w-full flex-col items-center justify-center p-8">
              <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Is this the correct answer?
              </p>
              <p className="text-center text-xl font-medium leading-relaxed">
                {round.displayedAnswer}
              </p>
            </CardContent>
          </Card>
        </button>
      </div>

      {!isFlipped && !answered && (
        <p className="text-center text-xs text-muted-foreground">
          Click the card or press <kbd className="rounded border px-1.5 py-0.5 font-mono text-[10px]">Space</kbd> to reveal an answer
        </p>
      )}

      {isFlipped && !answered && (
        <div className="flex flex-col gap-3">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Is the displayed answer correct for this question?
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 max-w-40 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300"
              onClick={() => judge(false)}
            >
              <X className="mr-2 h-5 w-5" />
              Incorrect
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1 max-w-40 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950 dark:hover:text-emerald-300"
              onClick={() => judge(true)}
            >
              <Check className="mr-2 h-5 w-5" />
              Correct
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Press <kbd className="rounded border px-1.5 py-0.5 font-mono text-[10px]">&larr;</kbd> for incorrect
            &middot; <kbd className="rounded border px-1.5 py-0.5 font-mono text-[10px]">&rarr;</kbd> for correct
          </p>
        </div>
      )}

      {answered && (
        <div className="flex flex-col items-center gap-4">
          <Card className={`w-full ${lastAnswerCorrect ? "border-emerald-300 dark:border-emerald-700" : "border-red-300 dark:border-red-700"}`}>
            <CardContent className="flex flex-col gap-2 p-4">
              <div className="flex items-center gap-2">
                {lastAnswerCorrect ? (
                  <CircleCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <CircleX className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                )}
                <p className={`text-sm font-semibold ${lastAnswerCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {lastAnswerCorrect ? "You got it right!" : "Not quite!"}
                </p>
              </div>
              {!lastAnswerCorrect && (
                <p className="text-sm text-muted-foreground">
                  The correct answer is: <span className="font-medium text-foreground">{round.correctAnswer}</span>
                </p>
              )}
              {lastAnswerCorrect && !round.showsCorrectAnswer && (
                <p className="text-sm text-muted-foreground">
                  Good catch! The correct answer is: <span className="font-medium text-foreground">{round.correctAnswer}</span>
                </p>
              )}
            </CardContent>
          </Card>

          <Button size="lg" onClick={advance}>
            {currentIndex === rounds.length - 1 ? "See Results" : "Next Card"}
          </Button>
          <p className="sr-only">Press Space or Enter to continue</p>
        </div>
      )}
    </div>
  );
}
