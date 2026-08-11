"use client";

import DashboardLoader from "@/components/DashboardLoader";
import Footer from "@/components/Footer";
import {
  getMyWithdrawals,
  requestWithdraw,
} from "@/lib/api/withdraw";
import { UserDataType } from "@/types/UserData";
import { formatCurrency } from "@/utils/formatCurrency";
import { FormEvent, useCallback, useEffect, useState } from "react";

type WithdrawLog = {
  _id: string;
  amount: number;
  paymentMethod: string;
  accountNumber: string;
  status: "pending" | "paid" | "rejected";
  createdAt: string;
};

export default function WithdrawPage() {
  const [currentUser, setCurrentUser] =
    useState<UserDataType | null>(null);

  const [loadingUser, setLoadingUser] =
    useState(true);

  const [logs, setLogs] = useState<WithdrawLog[]>([]);

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bkash");
  const [accNo, setAccNo] = useState("");
  const [message, setMessage] = useState("");

  // ----------------------------------------
  // Refresh user + withdrawal history
  // ----------------------------------------

  const refresh = useCallback(async () => {
    try {
      setLoadingUser(true);

      // Unified API:
      // Works for Supabase + existing Clerk users.
      const userRes = await fetch("/api/user", {
        cache: "no-store",
      });

      if (!userRes.ok) {
        throw new Error("Failed to fetch user.");
      }

      const user = await userRes.json();

      setCurrentUser(user);

      const withdrawRes = await getMyWithdrawals();

      if (withdrawRes.success) {
        setLogs(withdrawRes.withdrawals);
      }
    } catch (error) {
      console.error("Failed to refresh withdrawal page:", error);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  // ----------------------------------------
  // Initial load
  // ----------------------------------------

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [refresh]);

  // ----------------------------------------
  // Submit withdrawal
  // ----------------------------------------

  async function handleWithdraw(
    e: FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    setMessage("");

    const value = Number(amount);

    if (!Number.isFinite(value)) {
      setMessage("Please enter a valid amount.");
      return;
    }

    if (value < 20) {
      setMessage("Minimum withdrawal amount is 20.");
      return;
    }

    const result = await requestWithdraw({
      amount: value,
      paymentMethod,
      accountNumber: accNo,
    });

    if (!result.success) {
      setMessage(result.message);
      return;
    }

    setAmount("");
    setMessage(result.message);

    await refresh();
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
          Please try again later.
        </p>

        <button
          onClick={() => {
            window.location.reload();
          }}
          className="mt-5 rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ----------------------------------------
  // Page
  // ----------------------------------------

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <section className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-lg">
        {/* ----------------------------------------
            Header
        ----------------------------------------- */}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-600">
              Withdraw Balance
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Manage Withdrawal Requests
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700">
              Min: {formatCurrency(20)}
            </div>

            <button
              onClick={refresh}
              className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* ----------------------------------------
            Balance Summary
        ----------------------------------------- */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Total Earned
            </p>

            <h2 className="mt-2 text-xl font-bold">
              {formatCurrency(
                Number(currentUser.totalEarned),
              )}
            </h2>
          </div>

          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Current Balance
            </p>

            <h2 className="mt-2 text-xl font-bold">
              {formatCurrency(
                Number(currentUser.balance),
              )}
            </h2>
          </div>

          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Pending Amount
            </p>

            <h2 className="mt-2 text-xl font-bold">
              {formatCurrency(
                Number(currentUser.pending),
              )}
            </h2>
          </div>
        </div>

        {/* ----------------------------------------
            Withdrawal Form
        ----------------------------------------- */}

        <form
          onSubmit={handleWithdraw}
          className="mb-8 rounded-xl border bg-slate-50 p-5"
        >
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Withdrawal Amount (Minimum 20)
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              required
              min="20"
              type="number"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              placeholder="20"
              className="flex-1 rounded-lg border px-4 py-3 outline-none focus:border-indigo-500"
            />

            <select
              required
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value)
              }
              className="flex-1 rounded-lg border px-4 py-3 outline-none focus:border-indigo-500"
            >
              <option value="Bkash">Bkash</option>
              <option value="Nagad">Nagad</option>
              <option value="Rocket">Rocket</option>
              <option value="Mobile Recharge">
                Mobile Recharge
              </option>
              <option value="Binance Pay">
                Binance Pay
              </option>
            </select>

            <input
              type="text"
              required
              value={accNo}
              onChange={(e) =>
                setAccNo(e.target.value)
              }
              placeholder="Account Number"
              className="flex-1 rounded-lg border px-4 py-3 outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Request Withdrawal
            </button>
          </div>

          {message && (
            <p className="mt-3 text-sm font-medium text-emerald-600">
              {message}
            </p>
          )}
        </form>

        {/* ----------------------------------------
            Withdrawal History
        ----------------------------------------- */}

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Withdrawal History
            </h2>

            <span className="text-sm text-slate-500">
              {logs.length} Request(s)
            </span>
          </div>

          {logs.length === 0 ? (
            <div className="rounded-xl border bg-slate-50 p-10 text-center text-slate-500">
              No withdrawal requests found.
            </div>
          ) : (
            <div className="overflow-auto rounded-xl border">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      Amount
                    </th>

                    <th className="px-4 py-3 text-left">
                      Method
                    </th>

                    <th className="px-4 py-3 text-left">
                      Account
                    </th>

                    <th className="px-4 py-3 text-left">
                      Date
                    </th>

                    <th className="px-4 py-3 text-left">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log._id}
                      className="border-t transition hover:bg-slate-50"
                    >
                      <td className="px-4 py-4 font-semibold">
                        {formatCurrency(log.amount)}
                      </td>

                      <td className="px-4 py-4">
                        {log.paymentMethod}
                      </td>

                      <td className="px-4 py-4 font-mono text-sm">
                        {log.accountNumber}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {new Date(
                          log.createdAt,
                        ).toLocaleString()}
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
