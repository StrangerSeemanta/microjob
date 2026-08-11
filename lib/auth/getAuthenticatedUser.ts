import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();

    // =====================================================
    // 1. Try Supabase first
    // =====================================================

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },

          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(
                ({ name, value, options }) => {
                  cookieStore.set(name, value, options);
                },
              );
            } catch {
              // Cookie updates are handled by proxy.ts
            }
          },
        },
      },
    );

    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    let email =
      supabaseUser?.email?.trim().toLowerCase() ?? null;

    let provider:
      | "supabase"
      | "clerk"
      | null = supabaseUser
      ? "supabase"
      : null;

    // =====================================================
    // 2. If Supabase isn't authenticated,
    //    try existing Clerk session
    // =====================================================

    if (!email) {
      const clerkUser = await currentUser();

      if (clerkUser) {
        email =
          clerkUser.emailAddresses[0]?.emailAddress
            ?.trim()
            .toLowerCase() ?? null;

        if (email) {
          provider = "clerk";
        }
      }
    }

    // =====================================================
    // 3. No authenticated user
    // =====================================================

    if (!email || !provider) {
      return {
        authenticated: false,
        user: null,
        email: null,
        provider: null,
      };
    }

    // =====================================================
    // 4. Find MongoDB user by email
    // =====================================================

    await connectDB();

    const user = await User.findOne({
      email: email,
    });

    if (!user) {
      return {
        authenticated: true,
        user: null,
        email,
        provider,
      };
    }

    // =====================================================
    // 5. Return unified authenticated user
    // =====================================================

    return {
      authenticated: true,
      user,
      email,
      provider,
    };
  } catch (error) {
    console.error(
      "[getAuthenticatedUser] Error:",
      error,
    );

    return {
      authenticated: false,
      user: null,
      email: null,
      provider: null,
    };
  }
}

