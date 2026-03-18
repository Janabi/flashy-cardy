import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

/** Protected app areas — unauthenticated users are sent to `/` (modal auth on home), never to a sign-in page. */
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/decks(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return

  const { userId } = await auth()
  if (!userId) {
    return NextResponse.redirect(new URL('/', req.url))
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
