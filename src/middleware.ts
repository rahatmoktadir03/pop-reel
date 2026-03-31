import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/feed(.*)",
  "/explore(.*)",
  "/video/(.*)",
  "/profile/(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/videos(.*)",
  "/api/recommendations(.*)",
  "/api/search(.*)",
  "/api/users/(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
