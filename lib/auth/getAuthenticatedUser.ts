import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

type AuthProvider = "supabase" | "clerk";

export async function getAuthenticatedUser() {
  try {
    // =====================================================
    // 1. Create Supabase server client
    // =====================================================

    const cookieStore = await cookies();

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

    // =====================================================
    // 2. Try Supabase authentication
    // =====================================================

    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    let email: string | null =
      supabaseUser?.email
        ?.trim()
        .toLowerCase() ?? null;

    let provider: AuthProvider | null =
      supabaseUser ? "supabase" : null;

    // =====================================================
    // 3. If Supabase isn't authenticated,
    //    try Clerk
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
    // 4. No authenticated provider
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
    // 5. Connect MongoDB
    // =====================================================

    await connectDB();

    // =====================================================
    // 6. Find canonical MongoDB User
    // =====================================================

    const user = await User.findOne({
      email,
    });

    // =====================================================
    // 7. Authenticated but MongoDB user missing
    // =====================================================

    if (!user) {
      return {
        authenticated: true,
        user: null,
        email,
        provider,
      };
    }

    // =====================================================
    // 8. Return unified identity
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
