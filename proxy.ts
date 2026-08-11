import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  /*
   * ---------------------------------------
   * SUPABASE SESSION REFRESH
   * ---------------------------------------
   *
   * This runs for the request so Supabase
   * authentication cookies remain available
   * to server-side code and API routes.
   */

  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            req.cookies.set(name, value);
          });

          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  await supabase.auth.getUser();

  /*
   * ---------------------------------------
   * EXISTING CLERK ADMIN PROTECTION
   * ---------------------------------------
   *
   * Keep this temporarily.
   */

  if (!isAdminRoute(req)) {
    return response;
  }

  const {
    userId,
    sessionClaims,
    redirectToSignIn,
  } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  if (sessionClaims?.role !== "admin") {
    return NextResponse.redirect(
      new URL("/unauthorized", req.url),
    );
  }

  return response;
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};