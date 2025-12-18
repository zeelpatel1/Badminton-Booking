import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isAdminRoute = createRouteMatcher(["/admin(.*)"])

export default clerkMiddleware((auth, req) => {
  if (isAdminRoute(req)) {
    auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js|png|jpg|svg|ico)).*)",
    "/(api|trpc)(.*)",
  ],
}
