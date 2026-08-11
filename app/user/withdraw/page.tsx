"use client";

import DashboardLoader from "@/components/DashboardLoader";
import Footer from "@/components/Footer";
import { getMyWithdrawals, requestWithdraw } from "@/lib/api/withdraw";
import { UserDataType } from "@/types/UserData";
import { formatCurrency } from "@/utils/formatCurrency";
import { FormEvent, useCallback, useEffect, useState } from "react";

type WithdrawLog = {
  id: string;
  userId: string;

  amount: number;

  paymentMethod: string;
  accountNumber: string;
  accountName?: string;

  status: "pending" | "paid" | "rejected";

  note?: string;
  rejectionReason?: string;
  transactionId?: string;

  reviewedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
};

/*
 * IMPORTANT
 *
 * /api/user returns the user directly.
 *
 * Example:
 *
 * {
 *   success: true,
 *   provider: "clerk",
 *   id: "...",
 *   email: "...",
 *   balance: 100,
 *   pending: 20,
 *   totalEarned: 150
 * }
 *
 * There is NO `user` property.
 */
type UserApiResponse = UserDataType & {
  success: boolean;
  provider: "supabase" | "clerk" | null;
  error?: string;
};

export default function WithdrawPage() {
  const [currentUser, setCurrentUser] = useState<UserDataType | null>(null);

  const [loadingUser, setLoadingUser] = useState(true);

  const [logs, setLogs] = useState<WithdrawLog[]>([]);

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bkash");
  const [accNo, setAccNo] = useState("");

  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ----------------------------------------
  // Refresh user + withdrawal history
  // ----------------------------------------

  const refresh = useCallback(async () => {
    try {
      setLoadingUser(true);
      setMessage("");

      // ------------------------------------
      // Get authenticated user
      // ------------------------------------

      const userRes = await fetch("/api/user", {
        method: "GET",
        cache: "no-store",
        credentials: "include",
      });

      const userData = (await userRes.json()) as UserApiResponse;

      /*
       * /api/user returns:
       *
       * {
       *   success: true,
       *   id: "...",
       *   email: "...",
       *   balance: 100,
       *   ...
       * }
       *
       * NOT:
       *
       * {
       *   user: {...}
       * }
       */

      if (!userRes.ok || !userData.success) {
        throw new Error(userData.error || "Failed to fetch user.");
      }

      // Store the complete user object.
      setCurrentUser(userData);

      // ------------------------------------
      // Get withdrawal history
      // ------------------------------------

      const withdrawRes = await getMyWithdrawals();

      if (!withdrawRes.success) {
        throw new Error(
          withdrawRes.message || "Failed to fetch withdrawal history.",
        );
      }

      setLogs((withdrawRes.withdrawals || []) as WithdrawLog[]);
    } catch (error) {
      console.error("Failed to refresh withdrawal page:", error);

      setCurrentUser(null);
      setLogs([]);

      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to load withdrawal data.",
      );
    } finally {
      setLoadingUser(false);
    }
  }, []);

  // ----------------------------------------
  // Initial load
  // ----------------------------------------

  useEffect(() => {
    // Defer the async refresh so state updates happen outside the
    // effect body itself, which avoids react-hooks/set-state-in-effect.
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh]);

  // ----------------------------------------
  // Submit withdrawal
  // ----------------------------------------

  async function handleWithdraw(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (submitting) return;

    setMessage("");

    const value = Number(amount);

    // ------------------------------------
    // Validate amount
    // ------------------------------------

    if (!Number.isFinite(value) || value <= 0) {
      setMessage("Please enter a valid withdrawal amount.");
      return;
    }

    if (value < 20) {
      setMessage("Minimum withdrawal amount is 20 BDT.");
      return;
    }

    // ------------------------------------
    // Client-side balance check
    // ------------------------------------

    const balance = Number(currentUser?.balance ?? 0);

    if (value > balance) {
      setMessage("Insufficient balance.");
      return;
    }

    // ------------------------------------
    // Account validation
    // ------------------------------------

    if (!accNo.trim()) {
      setMessage("Please enter your account number.");
      return;
    }

    try {
      setSubmitting(true);

      const result = await requestWithdraw({
        amount: value,
        paymentMethod,
        accountNumber: accNo.trim(),
      });

      if (!result.success) {
        setMessage(result.message || "Withdrawal request failed.");
        return;
      }

      // ----------------------------------
      // Reset form
      // ----------------------------------

      setAmount("");
      setAccNo("");

      setMessage(
        result.message || "Withdrawal request submitted successfully.",
      );

      // ----------------------------------
      // Refresh balance + history
      // ----------------------------------

      await refresh();
    } catch (error) {
      console.error("Withdrawal submission error:", error);

      setMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ----------------------------------------
  // Loading
  // ----------------------------------------

  if (loadingUser) {
    return <DashboardLoader />;
  }

  // ----------------------------------------
  // User unavailable
  // ----------------------------------------

  if (!currentUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <h1 className="text-lg font-bold text-red-500">
          User data not available.
        </h1>

        <p className="mt-2 text-gray-500">
          {message || "Please try again later."}
        </p>

        <button
          type="button"
          onClick={() => void refresh()}
          className="mt-5 rounded-lg bg-red-600 px-5 py-2 font-semibold text-white transition hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ----------------------------------------
  // Derived values
  // ----------------------------------------

  const balance = Number(currentUser.balance ?? 0);

  const pending = Number(currentUser.pending ?? 0);

  const totalEarned = Number(currentUser.totalEarned ?? 0);

  // ----------------------------------------
  // Page
  // ----------------------------------------

  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <section className="mx-auto max-w-5xl rounded-2xl bg-white p-4 shadow-lg sm:p-6">
        {/* Header */}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-600">
              Withdraw Balance
            </p>

            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Manage Withdrawal Requests
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Secure withdrawal system
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700">
              Min: {formatCurrency(20)}
            </div>

            <button
              type="button"
              onClick={() => void refresh()}
              disabled={loadingUser}
              className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Balance Summary */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Total Earned</p>

            <h2 className="mt-2 text-xl font-bold">
              {formatCurrency(totalEarned)}
            </h2>
          </div>

          <div className="rounded-xl border bg-emerald-50 p-4">
            <p className="text-sm text-emerald-700">Available Balance</p>

            <h2 className="mt-2 text-xl font-bold text-emerald-700">
              {formatCurrency(balance)}
            </h2>
          </div>

          <div className="rounded-xl border bg-yellow-50 p-4">
            <p className="text-sm text-yellow-700">Pending Withdrawal</p>

            <h2 className="mt-2 text-xl font-bold text-yellow-700">
              {formatCurrency(pending)}
            </h2>
          </div>
        </div>

        {/* Withdrawal Form */}

        <form
          onSubmit={handleWithdraw}
          className="mb-8 rounded-xl border bg-slate-50 p-5"
        >
          <div className="mb-4">
            <h2 className="text-lg font-bold">Request Withdrawal</h2>

            <p className="mt-1 text-sm text-slate-500">
              Your balance will be moved to pending until an administrator
              processes the request.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {/* Amount */}

            <div>
              <label
                htmlFor="withdraw-amount"
                className="mb-2 block text-sm font-medium text-slate-600"
              >
                Withdrawal Amount
              </label>

              <input
                id="withdraw-amount"
                required
                min="20"
                step="0.01"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="20"
                disabled={submitting}
                className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-indigo-500 disabled:bg-slate-100"
              />
            </div>

            {/* Payment Method */}

            <div>
              <label
                htmlFor="payment-method"
                className="mb-2 block text-sm font-medium text-slate-600"
              >
                Payment Method
              </label>

              <select
                id="payment-method"
                required
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={submitting}
                className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-indigo-500 disabled:bg-slate-100"
              >
                <option value="Bkash">Bkash</option>

                <option value="Nagad">Nagad</option>

                <option value="Rocket">Rocket</option>

                <option value="Mobile Recharge">Mobile Recharge</option>

                <option value="Binance Pay">Binance Pay</option>
              </select>
            </div>

            {/* Account Number */}

            <div>
              <label
                htmlFor="account-number"
                className="mb-2 block text-sm font-medium text-slate-600"
              >
                Account Number
              </label>

              <input
                id="account-number"
                type="text"
                required
                value={accNo}
                onChange={(e) => setAccNo(e.target.value)}
                placeholder="Account Number"
                disabled={submitting}
                className="w-full rounded-lg border px-4 py-3 outline-none transition focus:border-indigo-500 disabled:bg-slate-100"
              />
            </div>

            {/* Submit */}

            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Request Withdrawal"}
              </button>
            </div>
          </div>

          {/* Message */}

          {message && (
            <div
              className={`mt-4 rounded-lg border px-4 py-3 text-sm font-medium ${
                message.toLowerCase().includes("success") ||
                message.toLowerCase().includes("submitted")
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>
          )}
        </form>

        {/* Withdrawal History */}

        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Withdrawal History</h2>

              <p className="text-sm text-slate-500">
                Your recent withdrawal requests
              </p>
            </div>

            <span className="text-sm text-slate-500">
              {logs.length} Request
              {logs.length !== 1 ? "s" : ""}
            </span>
          </div>

          {logs.length === 0 ? (
            <div className="rounded-xl border bg-slate-50 p-10 text-center text-slate-500">
              No withdrawal requests found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[700px]">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Amount</th>

                    <th className="px-4 py-3 text-left">Method</th>

                    <th className="px-4 py-3 text-left">Account</th>

                    <th className="px-4 py-3 text-left">Date</th>

                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-t transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 font-semibold">
                        {formatCurrency(log.amount)}
                      </td>

                      <td className="px-4 py-4">{log.paymentMethod}</td>

                      <td className="px-4 py-4 font-mono text-sm">
                        {log.accountNumber}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                            log.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : log.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {log.status}
                        </span>

                        {log.status === "rejected" && log.rejectionReason && (
                          <p className="mt-2 max-w-xs text-xs text-red-600">
                            {log.rejectionReason}
                          </p>
                        )}

                        {log.status === "paid" && log.transactionId && (
                          <p className="mt-2 max-w-xs break-all text-xs text-green-600">
                            TX: {log.transactionId}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <Footer />
      </section>
    </main>
  );
}
