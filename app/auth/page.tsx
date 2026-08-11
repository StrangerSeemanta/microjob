"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const supabase = createClient();

  // ==================================================
  // Clerk
  // ==================================================

  const {
    isLoaded: clerkLoaded,
    isSignedIn: clerkSignedIn,
  } = useAuth();

  const { user: clerkUser } = useUser();

  // ==================================================
  // Supabase
  // ==================================================

  const [supabaseLoaded, setSupabaseLoaded] =
    useState(false);

  const [supabaseSignedIn, setSupabaseSignedIn] =
    useState(false);

  // ==================================================
  // Form
  // ==================================================

  const [mode, setMode] =
    useState<"login" | "signup">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authLoading, setAuthLoading] =
    useState(false);

  const [message, setMessage] = useState("");

  // ==================================================
  // Sync MongoDB User
  // ==================================================

  async function syncMongoUser() {
    const response = await fetch("/api/user/sync", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.error ||
          data.message ||
          "Failed to synchronize user account.",
      );
    }

    return data;
  }

  // ==================================================
  // Check Supabase session
  // ==================================================

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          setSupabaseSignedIn(!!session);
          setSupabaseLoaded(true);
        }
      } catch (error) {
        console.error(
          "Supabase session check failed:",
          error,
        );

        if (mounted) {
          setSupabaseSignedIn(false);
          setSupabaseLoaded(true);
        }
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;

        setSupabaseSignedIn(!!session);
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  // ==================================================
  // Authentication redirect
  // ==================================================

  useEffect(() => {
    if (!clerkLoaded || !supabaseLoaded) {
      return;
    }

    if (clerkSignedIn || supabaseSignedIn) {
      window.location.replace("/user/dashboard");
    }
  }, [
    clerkLoaded,
    supabaseLoaded,
    clerkSignedIn,
    supabaseSignedIn,
  ]);

  // ==================================================
  // Loading screen
  // ==================================================

  if (!clerkLoaded || !supabaseLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-2xl ring-1 ring-red-400/30">
            ✦
          </div>

          <h1 className="text-lg font-semibold">
            Checking your account...
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Please wait while we securely check your
            session.
          </p>
        </div>
      </main>
    );
  }

  // ==================================================
  // Already authenticated
  // ==================================================

  if (clerkSignedIn || supabaseSignedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="text-lg font-semibold">
            Redirecting...
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Your account is already signed in.
          </p>
        </div>
      </main>
    );
  }

  // ==================================================
  // Login / Signup
  // ==================================================

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setAuthLoading(true);
    setMessage("");

    try {
      // ------------------------------------------------
      // Safety check
      // ------------------------------------------------

      if (clerkSignedIn || supabaseSignedIn) {
        window.location.replace("/user/dashboard");
        return;
      }

      // ------------------------------------------------
      // LOGIN
      // ------------------------------------------------

      if (mode === "login") {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
          });

        if (error) {
          throw error;
        }

        // Make sure Supabase actually created a session.
        if (!data.session) {
          throw new Error(
            "Login succeeded, but no Supabase session was created.",
          );
        }

        // ------------------------------------------------
        // Sync Supabase user → MongoDB
        // ------------------------------------------------

        await syncMongoUser();

        // ------------------------------------------------
        // Dashboard
        // ------------------------------------------------

        window.location.replace("/user/dashboard");
        return;
      }

      // ------------------------------------------------
      // SIGNUP
      // ------------------------------------------------

      const { data, error } =
        await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        });

      if (error) {
        throw error;
      }

      // ------------------------------------------------
      // Session immediately available
      // ------------------------------------------------

      if (data.session) {
        // Create/sync MongoDB User document.
        await syncMongoUser();

        window.location.replace("/user/dashboard");
        return;
      }

      // ------------------------------------------------
      // Email confirmation enabled
      // ------------------------------------------------

      setMessage(
        "Account created successfully. Please check your email to confirm your account.",
      );
    } catch (error) {
      console.error(
        "Authentication error:",
        error,
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Authentication failed. Please try again.",
      );
    } finally {
      setAuthLoading(false);
    }
  }

  // ==================================================
  // Sign out
  // ==================================================

  async function handleSignOut() {
    setAuthLoading(true);
    setMessage("");

    try {
      if (supabaseSignedIn) {
        const { error } =
          await supabase.auth.signOut();

        if (error) {
          throw error;
        }

        setSupabaseSignedIn(false);
      }

      if (clerkSignedIn) {
        setMessage(
          "Please use the Clerk account controls to sign out of your Clerk session.",
        );

        return;
      }

      setMode("login");
      setEmail("");
      setPassword("");

      setMessage(
        "Signed out successfully.",
      );
    } catch (error) {
      console.error(
        "Sign out failed:",
        error,
      );

      setMessage(
        error instanceof Error
          ? error.message
          : "Sign out failed.",
      );
    } finally {
      setAuthLoading(false);
    }
  }

  // ==================================================
  // Render
  // ==================================================

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-950 via-red-950 to-slate-900 px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
        {/* Logo */}

        <div className="mb-6 text-center">
          <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 text-3xl ring-1 ring-red-400/30">
            ✦
          </div>

          <h1 className="text-3xl font-black uppercase tracking-[0.2em]">
            Microjob
          </h1>

          <p className="mt-2 text-sm text-slate-300">
            {mode === "login"
              ? "Welcome back. Continue earning."
              : "Create your account and start earning."}
          </p>
        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Email
            </label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              autoComplete="email"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-red-400/60 focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Password
            </label>

            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              minLength={6}
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-red-400/60 focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full rounded-full bg-linear-to-r from-red-500 to-orange-500 px-6 py-3 font-semibold text-white shadow-lg shadow-red-500/25 transition hover:scale-[1.01] hover:from-red-400 hover:to-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {authLoading
              ? "Please wait..."
              : mode === "login"
                ? "Login"
                : "Create Account"}
          </button>
        </form>

        {/* Message */}

        {message && (
          <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 p-3 text-center text-sm text-slate-300">
            {message}
          </div>
        )}

        {/* Switch mode */}

        <button
          type="button"
          disabled={authLoading}
          onClick={() => {
            setMode(
              mode === "login"
                ? "signup"
                : "login",
            );

            setMessage("");
          }}
          className="mt-5 w-full text-sm text-slate-400 transition hover:text-white disabled:opacity-50"
        >
          {mode === "login"
            ? "Don't have an account? Create one"
            : "Already have an account? Login"}
        </button>

        {/* Sign out */}

        {(supabaseSignedIn || clerkSignedIn) && (
          <button
            type="button"
            onClick={handleSignOut}
            disabled={authLoading}
            className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
          >
            Sign out
          </button>
        )}

        {/* Existing Clerk information */}

        {clerkSignedIn && (
          <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/40 p-3 text-center text-xs text-slate-400">
            Clerk account detected
            {clerkUser?.primaryEmailAddress
              ?.emailAddress
              ? `: ${clerkUser.primaryEmailAddress.emailAddress}`
              : ""}
          </div>
        )}
      </div>
    </main>
  );
}
