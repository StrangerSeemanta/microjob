"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Mail, Phone, User } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  phone?: string | null;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  role?: string;
  balance?: number;
  tasksCompleted?: number;
  referralId?: string;
  createdAt?: string;
}

const supabase = createClient();

export default function Page() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch("/api/user", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Failed to load profile",
          );
        }

        setUser(data);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await supabase.auth.signOut();

      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 text-white">
        <div className="text-sm text-slate-400">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 px-4 text-center text-white">
        <div>
          <h1 className="text-xl font-semibold">
            Profile unavailable
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Please sign in again.
          </p>

          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="mt-5 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold transition hover:bg-red-500"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const displayName =
    [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ") ||
    user.username ||
    "User";

  const profileImage =
    user.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName,
    )}&background=111827&color=ffffff`;

  const joinedDate = user.createdAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(user.createdAt))
    : "N/A";

  return (
    <div className="min-h-screen w-full bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Account
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Your Profile
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage your Microjob account information.
          </p>
        </div>

        {/* Profile card */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">

          {/* Profile header */}
          <div className="bg-linear-to-br from-slate-900 via-red-950 to-slate-900 p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              <img
                src={profileImage}
                alt={displayName}
                className="h-24 w-24 rounded-2xl border border-white/20 object-cover shadow-xl"
              />

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold">
                    {displayName}
                  </h2>

                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-200">
                    {user.role || "user"}
                  </span>
                </div>

                <p className="mt-2 break-all text-sm text-slate-300">
                  {user.email}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Member since {joinedDate}
                </p>
              </div>
            </div>
          </div>

          {/* Account information */}
          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-8">

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <Mail
                  size={18}
                  className="text-sky-400"
                />

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm font-medium text-slate-200">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <Phone
                  size={18}
                  className="text-emerald-400"
                />

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Phone
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-200">
                    {user.phone || "Not added"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <User
                  size={18}
                  className="text-purple-400"
                />

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Username
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-200">
                    {user.username || "Not set"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  Referral ID
                </p>

                <p className="mt-1 break-all text-sm font-medium text-slate-200">
                  {user.referralId || "Not available"}
                </p>
              </div>
            </div>
          </div>

          {/* Account stats */}
          <div className="border-t border-white/10 p-5 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
              Account statistics
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                <p className="text-sm text-emerald-300">
                  Balance
                </p>

                <p className="mt-1 text-2xl font-bold">
                  BDT{" "}
                  {Number(user.balance || 0).toFixed(2)}
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
                <p className="text-sm text-cyan-300">
                  Tasks Completed
                </p>

                <p className="mt-1 text-2xl font-bold">
                  {user.tasksCompleted || 0}
                </p>
              </div>

            </div>
          </div>

          {/* Logout */}
          <div className="border-t border-white/10 p-5 sm:p-8">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={18} />

              {loggingOut
                ? "Signing out..."
                : "Sign Out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

