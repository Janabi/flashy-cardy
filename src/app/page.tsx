import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-16">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            FlashyCardy
          </h1>
          <p className="text-lg text-muted-foreground">
            Your personal flashcard platform
          </p>
        </div>
        <div className="flex gap-4">
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <Button variant="outline" size="lg">
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
            <Button size="lg">Sign up</Button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}
