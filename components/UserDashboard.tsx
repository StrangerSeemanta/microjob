/* eslint-disable @next/next/no-img-element */
"use client";

import { UserDataResponse } from "@/types/UserData";
import Link from "next/link";
import { useEffect, useState } from "react";
import DashboardLoader from "./DashboardLoader";
import { Copy, CreditCard } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { toast } from "./ui/toast";
import { addPhoneNumber } from "@/app/actions/addPhone";
import Footer from "./Footer";
import Banner from "./Banner";
import { useAuth, useClerk } from "@clerk/nextjs";
import { createClient } from "@/lib/supabase/client";

function UserDashboard() {
  const supabase = createClient();
  const { signOut } = useClerk();

  const { isSignedIn: clerkSignedIn } = useAuth();
  const [supabaseSignedIn, setSupabaseSignedIn] = useState(false);

  const [loadingUser, setLoadingUser] = useState(true);
  const [currentUser, setUser] = useState<UserDataResponse | null>(null);

  const [copyButtonText, setCopyButtonText] = useState<
    "Copy" | "Copying" | "Copied"
  >("Copy");

  const [isSubmittingPhone, setSubmitPhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [referredBy, setReferredBy] = useState("");

  // =========================================================
  // LOAD UNIFIED USER
  // =========================================================
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          setSupabaseSignedIn(!!session);
        }
      } catch (error) {
        console.error("Supabase session check failed:", error);

        if (mounted) {
          setSupabaseSignedIn(false);
        }
      }
    }

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setSupabaseSignedIn(!!session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const response__ = await fetch("/api/user/sync", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });

        const data__ = await response__.json();

        if (!response__.ok || !data__.success) {
          throw new Error(
            data__.error ||
              data__.message ||
              "Failed to synchronize user account.",
          );
        }
        const response = await fetch("/api/user", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || data.message || "Failed to fetch user data.",
          );
        }

        /*
         * /api/user currently returns the MongoDB user
         * directly at the root level.
         *
         * Example:
         * {
         *   id: "...",
         *   email: "...",
         *   balance: 0,
         *   ...
         * }
         */

        if (!data.id || !data.email) {
          throw new Error(
            data.error ||
              data.message ||
              "Invalid user data received from server.",
          );
        }

        if (!mounted) return;

        setUser(data as UserDataResponse);
      } catch (error) {
        console.error("[UserDashboard] Error loading user:", error);

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoadingUser(false);
        }
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  // =========================================================
  // LOADING
  // =========================================================

  if (loadingUser) {
    return <DashboardLoader />;
  }

  // =========================================================
  // USER UNAVAILABLE
  // =========================================================

  if (!currentUser) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center px-4 text-center">
        <h1 className="text-lg font-bold text-red-500">
          ❌ User data not available.
        </h1>

        <p className="mt-2 text-white">
          Please try again later or contact support.
        </p>

        <button
          onClick={() => {
            window.location.href = "/";
          }}
          className="mt-4 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Back Home
        </button>
      </div>
    );
  }

  // =========================================================
  // USER INFORMATION
  // =========================================================

  const role =
    typeof currentUser.publicMetadata?.role === "string"
      ? currentUser.publicMetadata.role
      : currentUser.role || "n/a";

  const balance = Number(currentUser.balance || 0);

  const formattedBalance = formatCurrency(balance);

  const displayName =
    [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") ||
    currentUser.username ||
    "User";

  const primaryEmail = currentUser.email || "No email";

  const joinedDate = currentUser.createdAt
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(currentUser.createdAt))
    : "N/A";

  // =========================================================
  // PROFILE IMAGE
  // =========================================================

  const profileImage =
    currentUser.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName,
    )}&background=111827&color=ffffff`;

  // =========================================================
  // PHONE + REFERRAL
  // =========================================================

  const handleSubmitPhone = async (formData: FormData) => {
    try {
      setSubmitPhone(true);

      const result = await addPhoneNumber(formData);

      if (!result.success) {
        toast.add({
          type: "error",
          title: "Failed To Add Phone Number",
          description: result.message,
        });

        return;
      }

      toast.add({
        type: "success",
        title: "Phone Number Added",
        description: "Phone Number added successfully to the server.",
      });

      const referralId = formData.get("referredBy")?.toString().trim();

      // Referral is optional.
      if (referralId) {
        try {
          const response = await fetch("/api/referral", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              referralId,
            }),
          });

          const data = (await response.json()) as {
            success: boolean;
            message: string;
          };

          if (data.success) {
            toast.add({
              type: "success",
              title: "Referral Added",
              description: "Referral has been added successfully.",
            });
          } else {
            toast.add({
              type: "error",
              title: "Failed To Add Referral",
              description: data.message || "The referral could not be added.",
            });
          }
        } catch (error) {
          console.error("[UserDashboard] Referral error:", error);

          toast.add({
            type: "error",
            title: "Referral Error",
            description:
              "Phone number was saved, but referral processing failed.",
          });
        }
      }

      window.location.reload();
    } catch (error) {
      console.error("[UserDashboard] Phone/referral submission error:", error);

      toast.add({
        type: "error",
        title: "Error Happened",
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setSubmitPhone(false);
    }
  };

  // =========================================================
  // PHONE REGISTRATION SCREEN
  // =========================================================

  if (!currentUser.phone) {
    return (
      <form action={handleSubmitPhone}>
        <div className="flex min-h-screen w-full flex-col flex-wrap items-center justify-center gap-4 px-4">
          <label htmlFor="phone" className="text-lg font-medium text-slate-200">
            ENTER YOUR PHONE NUMBER
          </label>

          <input
            type="tel"
            name="phone"
            id="phone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter your phone number"
            className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            required
          />

          <label
            htmlFor="referredBy"
            className="text-lg font-medium text-slate-200"
          >
            Referral ID (who referred you)
          </label>

          <input
            type="text"
            name="referredBy"
            id="referredBy"
            value={referredBy}
            onChange={(e) => setReferredBy(e.target.value)}
            placeholder="Enter referral ID"
            className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />

          <div className="w-full max-w-md">
            <button
              type="submit"
              disabled={isSubmittingPhone}
              className="flex w-full items-center justify-center rounded-2xl bg-linear-to-r from-blue-600 via-cyan-500 to-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmittingPhone ? "Submitting..." : "Add Phone Number"}
            </button>
          </div>
        </div>
      </form>
    );
  }
  async function handleSignOut() {
    setLoadingUser(true);

    try {
      if (supabaseSignedIn) {
        const { error } = await supabase.auth.signOut();

        if (error) {
          throw error;
        }

        setSupabaseSignedIn(false);
      }

      if (clerkSignedIn) {
        signOut({ redirectUrl: "/" });
        return;
      }

      window.location.reload();
    } catch (error) {
      console.error("Sign out failed:", error);

      console.error(error instanceof Error ? error.message : "Sign out failed.");
    } finally {
      setLoadingUser(false);
    }
  }

  // =========================================================
  // DASHBOARD
  // =========================================================

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_35%),linear-gradient(135deg,#020617_0%,#0f172a_50%,#111827_100%)] p-3 text-white sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl">
        {/* Header */}
        <div className="bg-linear-to-br from-slate-950 via-red-950 to-slate-900 p-4 sm:p-6 lg:p-8 xl:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* Avatar */}
              <div className="shrink-0 rounded-2xl border border-white/30 bg-white/20 p-2 shadow-lg shadow-black/20">
                <img

                  src={profileImage}
                  alt={displayName}
                  className="h-16 w-16 rounded-xl object-cover"
                />
              </div>

              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="wrap-break-word text-2xl font-semibold sm:text-3xl">
                    {displayName}
                  </h2>

                  <span className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                    {role}
                  </span>
                </div>

                <p className="break-all text-sm text-slate-100 sm:text-base">
                  {primaryEmail}
                </p>

                <p className="break-all text-sm text-slate-100 sm:text-base">
                  {currentUser.phone}
                </p>

                <p className="text-sm text-slate-100/90">Joined {joinedDate}</p>
              </div>
            </div>

            <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:items-end">
              <div className="w-full rounded-2xl border border-white/20 bg-slate-950/30 px-4 py-3 text-left shadow-lg backdrop-blur sm:w-auto sm:text-right">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-200">
                  Available balance
                </p>

                <p className="mt-1 text-2xl font-semibold text-emerald-300">
                  BDT {formattedBalance}
                </p>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full rounded-full bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-white/80 sm:w-auto"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div>
          <Banner />
        </div>

        {/* Main content */}
        <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1.25fr_0.75fr] lg:p-8">
          {/* Profile */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4 shadow-inner shadow-black/20 sm:p-6">
            <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
                  Profile overview
                </p>

                <h3 className="mt-1 text-xl font-semibold text-white">
                  Your dashboard
                </h3>
              </div>

              <div className="w-fit rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-sm font-medium text-cyan-200">
                Active
              </div>
            </div>

            {/* MongoDB User ID */}
            <div className="relative rounded-2xl border border-white/10 bg-white/10 p-4 pr-24 sm:pr-28">
              <p className="text-sm text-slate-400">User ID</p>

              <p className="mt-1 break-all text-sm font-semibold">
                {currentUser.id}
              </p>

              <button
                type="button"
                onClick={async () => {
                  if (copyButtonText === "Copied") return;

                  try {
                    setCopyButtonText("Copying");

                    await navigator.clipboard.writeText(currentUser.id);

                    setCopyButtonText("Copied");

                    setTimeout(() => {
                      setCopyButtonText("Copy");
                    }, 2000);
                  } catch (error) {
                    console.error("Failed to copy user ID:", error);

                    setCopyButtonText("Copy");
                  }
                }}
                className="absolute right-2 top-2 flex flex-wrap items-center justify-between gap-2 rounded-full border border-white/20 bg-slate-950/30 px-3 py-1 text-xs font-medium text-slate-200 transition hover:bg-white hover:text-black"
              >
                <Copy size={10} />

                <span>{copyButtonText}</span>
              </button>
            </div>

            {/* Basic stats */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-slate-400">Role</p>

                <p className="mt-1 text-lg font-semibold">{role}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-slate-400">Email</p>

                <p className="mt-1 break-all text-sm font-semibold">
                  {primaryEmail}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm text-slate-400">Member since</p>

                <p className="mt-1 text-lg font-semibold">{joinedDate}</p>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-4 shadow-inner shadow-black/20 sm:p-6">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
              Quick stats
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex flex-col gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-emerald-200">Current balance</p>

                  <p className="mt-1 text-2xl font-semibold text-white">
                    {formattedBalance}
                  </p>
                </div>

                <Link
                  href="/user/withdraw"
                  className="flex w-fit items-center justify-center gap-2 rounded-full border border-white/20 bg-slate-950/30 px-3 py-2 text-base font-medium text-slate-200 transition hover:bg-white hover:text-black"
                >
                  <CreditCard />
                  Withdraw
                </Link>
              </div>

              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
                <p className="text-sm text-cyan-200">Tasks Completed</p>

                <p className="mt-1 text-2xl font-semibold text-white">
                  {currentUser.tasksCompleted || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-4 lg:p-8">
          {role === "admin" && (
            <Link
              href="/admin"
              className="group flex min-h-32 flex-col justify-between rounded-3xl border border-blue-400/30 bg-blue-600/90 p-5 transition duration-300 hover:-translate-y-1 hover:bg-blue-500 sm:min-h-36"
            >
              <span className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-100">
                Admin
              </span>

              <span className="text-xl font-semibold text-white">
                Admin Panel
              </span>
            </Link>
          )}

          <Link
            href="/user/tasks"
            className="group flex min-h-32 flex-col justify-between rounded-3xl border border-sky-400/30 bg-sky-600/90 p-5 transition duration-300 hover:-translate-y-1 hover:bg-sky-500 sm:min-h-36"
          >
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-100">
              Work
            </span>

            <span className="text-xl font-semibold text-white">Tasks</span>
          </Link>

          <Link
            href="/user/profile"
            className="group flex min-h-32 flex-col justify-between rounded-3xl border border-rose-400/30 bg-rose-600/90 p-5 transition duration-300 hover:-translate-y-1 hover:bg-rose-500 sm:min-h-36"
          >
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-100">
              Account
            </span>

            <span className="text-xl font-semibold text-white">Profile</span>
          </Link>

          <Link
            href="/user/refer"
            className="group flex min-h-32 flex-col justify-between rounded-3xl border border-emerald-400/30 bg-emerald-600/90 p-5 transition duration-300 hover:-translate-y-1 hover:bg-emerald-500 sm:min-h-36"
          >
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-100">
              Referral
            </span>

            <span className="text-xl font-semibold text-white">
              Refer A Friend
            </span>
          </Link>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default UserDashboard;
