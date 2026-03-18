"use client";

import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

/**
 * Client-side auth chrome. Clerk v7 App Router does not export SignedIn/SignedOut
 * for the root layout; useAuth() matches the same signed-in / signed-out behavior.
 */
export function ClerkHeaderAuth() {
  const { isLoaded, userId } = useAuth();

  if (!isLoaded) return null;

  if (userId) {
    return <UserButton />;
  }

  return (
    <>
      <SignInButton mode="modal" forceRedirectUrl="/dashboard">
        <Button variant="outline">Sign In</Button>
      </SignInButton>
      <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
        <Button>Sign Up</Button>
      </SignUpButton>
    </>
  );
}
