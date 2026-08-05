"use client";

import DashboardLoader from "@/components/DashboardLoader";
import { submitReferral } from "@/lib/api/referral";
import { UserDataType } from "@/types/UserData";
import { SignOutButton } from "@clerk/nextjs";
import { useEffect, useState, useCallback } from "react";

export default function ReferPage() {
  const [user, setUser] = useState<UserDataType | null>(null);

  const [loading, setLoading] = useState(true);

  const [referralId, setReferralId] = useState("");

  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/user");

      if (!response.ok) {
        throw new Error("Failed to fetch user.");
      }

      const data = await response.json();

      setUser(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refresh]);

  async function handleSubmit() {
    if (!referralId.trim()) {
      setMessage("Please enter a referral code.");
      return;
    }

    const result = await submitReferral(referralId.trim());

    setMessage(result.message);

    if (result.success) {
      setReferralId("");

      refresh();
    }
  }

  async function copyCode() {
    if (!user?.referralId) return;

    await navigator.clipboard.writeText(user.referralId);

    setMessage("Referral code copied.");
  }

  if (loading) {
    return <DashboardLoader />;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-xl font-bold text-red-500">User not found</h1>

        <SignOutButton>
          <button className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white">
            Logout
          </button>
        </SignOutButton>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Referral Program</p>

            <h1 className="text-2xl font-bold">Refer & Earn</h1>
          </div>

          <button
            onClick={refresh}
            className="rounded-lg border px-4 py-2 hover:bg-gray-100"
          >
            Refresh
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-5">
            <p className="text-sm text-gray-500">Your Referral Code</p>

            <h2 className="mt-2 text-sm font-bold ">
              {user.referralId}
            </h2>

            <button
              onClick={copyCode}
              className="mt-4 rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
            >
              Copy Code
            </button>
          </div>

          <div className="rounded-lg border p-5">
            <p className="text-sm text-gray-500">Successful Referrals</p>

            <h2 className="mt-2 text-4xl font-bold">{user.referralCount}</h2>
          </div>
        </div>

        {user.referredBy ? (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="font-medium text-green-700">
              Referral already claimed.
            </p>

            <p className="mt-1 text-sm text-green-600">
              Claimed using: {user.referredBy}
            </p>
          </div>
        ) : (
          <div className="space-y-4 rounded-lg border p-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Enter Referral Code
              </label>

              <input
                value={referralId}
                onChange={(e) => setReferralId(e.target.value)}
                placeholder="ABCDEFGH"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Claim Referral Reward
            </button>
          </div>
        )}

        {message && (
          <div className="rounded-lg border bg-gray-50 p-4 text-sm">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
