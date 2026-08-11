"use client";

import { useEffect, useState } from "react";

import UserDashboard from "./UserDashboard";

function AuthenticatedApp() {
  const [loading, setLoading] = useState(true);
  const [userReady, setUserReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function syncUser() {
      try {
        const response = await fetch("/api/user/sync", {
          method: "POST",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          console.error("User sync failed:", data);

          if (mounted) {
            setUserReady(false);
          }

          return;
        }

        if (mounted) {
          setUserReady(true);
        }
      } catch (error) {
        console.error("User sync error:", error);

        if (mounted) {
          setUserReady(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    syncUser();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="text-lg font-semibold">
            Loading your account...
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Synchronizing your Microjob account
          </p>
        </div>
      </div>
    );
  }

  if (!userReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-white/5 p-6 text-center">
          <h2 className="text-lg font-semibold">
            Unable to load your account
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Please refresh the page and try again.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <UserDashboard />;
}

function HeroSection() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAuthentication() {
      try {
        /*
         * We deliberately do NOT check Supabase or Clerk
         * directly on the client.
         *
         * /api/user/sync uses getAuthenticatedUser(),
         * which supports both:
         *
         *   Supabase
         *   Clerk
         *
         * The API response therefore becomes our single
         * authentication source for this page.
         */

        const response = await fetch("/api/user/sync", {
          method: "POST",
          cache: "no-store",
        });

        const data = await response.json();

        if (!mounted) return;

        if (
          response.ok &&
          data.success === true &&
          data.user
        ) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error,
        );

        if (mounted) {
          setAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkAuthentication();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="text-lg font-semibold">
            Loading...
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Checking your account
          </p>
        </div>
      </div>
    );
  }

  if (authenticated) {
    return <AuthenticatedApp />;
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-linear-to-br from-slate-950 via-red-950 to-slate-900 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/10 p-8 text-center shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/20 text-3xl ring-1 ring-red-400/30">
          ✦
        </div>

        <h1 className="text-4xl font-black uppercase tracking-[0.3em] text-white">
          Microjob
        </h1>

        <p className="mt-3 text-sm font-mono text-slate-200/90">
          Earn money by completing small tasks
        </p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-left">
          <p className="text-sm text-slate-300">
            Why join?
          </p>

          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            <li>
              • Flexible tasks you can do on your schedule
            </li>

            <li>
              • Fast payouts and simple onboarding
            </li>

            <li>
              • Earn from anywhere, anytime
            </li>
          </ul>
        </div>

        <button
          onClick={() => {
            window.location.href = "/auth";
          }}
          className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-linear-to-r from-red-500 to-orange-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-red-500/25 transition duration-200 hover:scale-[1.02] hover:from-red-400 hover:to-orange-400"
        >
          Start Earning Now!
        </button>
      </div>
    </div>
  );
}

export default HeroSection;

