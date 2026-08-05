"use client";

import DashboardLoader from "@/components/DashboardLoader";
import Footer from "@/components/Footer";
import { getMyWithdrawals, requestWithdraw } from "@/lib/api/withdraw";
import { UserDataType } from "@/types/UserData";
import { formatCurrency } from "@/utils/formatCurrency";
import { SignOutButton } from "@clerk/nextjs";
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
  const [currentUser, setCurrentUser] = useState<UserDataType | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [logs, setLogs] = useState<WithdrawLog[]>([]);

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bkash");
  const [accNo, setAccNo] = useState<string>("");
  const [message, setMessage] = useState("");

  const refresh = useCallback(async () => {
    try {
      setLoadingUser(true);

      const userRes = await fetch("/api/user");

      if (!userRes.ok) {
        throw new Error("Failed to fetch user.");
      }

      const user = await userRes.json();

      setCurrentUser(user);

      const withdrawRes = await getMyWithdrawals();

      if (withdrawRes.success) {
        setLogs(withdrawRes.withdrawals);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refresh]);
  async function handleWithdraw(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");

    const value = Number(amount);

    if (!Number.isFinite(value)) {
      setMessage("Please enter a valid amount.");
      return;
    }

    if (value < 100) {
      setMessage("Minimum withdrawal amount is ৳100.");
      return;
    }

    const result = await requestWithdraw({
      amount: value,

      // Replace these with your user's saved values if available
      paymentMethod: paymentMethod,

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

  if (loadingUser) {
    return <DashboardLoader />;
  }

  if (!currentUser) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <h1 className="text-lg font-bold text-red-500">
          User data not available.
        </h1>

        <p className="mt-2 text-gray-500">Please try again later.</p>

        <SignOutButton>
          <button className="mt-5 rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700">
            Logout
          </button>
        </SignOutButton>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <section className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-lg">
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
              Min: {formatCurrency(100)}
            </div>

            <button
              onClick={refresh}
              className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Total Withdrawn Amount</p>

            <h2 className="mt-2 text-xl font-bold">
              {formatCurrency(Number(currentUser.totalEarned))}
            </h2>
          </div>

          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Current Balance</p>

            <h2 className="mt-2 text-xl font-bold">
              {formatCurrency(Number(currentUser.balance))}
            </h2>
          </div>

          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Pending Amount</p>

            <h2 className="mt-2 text-xl font-bold">
              {formatCurrency(Number(currentUser.pending))}
            </h2>
          </div>

          {/* <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Pending Payments</p>

            <h2 className="mt-2 text-xl font-bold">
              {Number(currentUser.paymentPending)}
            </h2>
          </div>

          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Received Payments</p>

            <h2 className="mt-2 text-xl font-bold">
              {Number(currentUser.paymentReceived)}
            </h2>
          </div> */}
        </div>

        <form
          onSubmit={handleWithdraw}
          className="mb-8 rounded-xl border bg-slate-50 p-5"
        >
          <label className="mb-2 block text-sm font-medium text-slate-600">
            Withdrawal Amount (Minimum ৳100)
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              required
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              className="flex-1 rounded-lg border px-4 py-3 outline-none focus:border-indigo-500"
            />
            <select
              required
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="flex-1 rounded-lg border px-4 py-3 outline-none focus:border-indigo-500"
            >
              <option key={"bkash"}>Bkash</option>
              <option key={"nogod"}>Nogod</option>
              <option key={"rocket"}>Rocket</option>
              <option key={"mobile"}>Mobile Recharge</option>
            </select>
            <input
              type="text"
              required
              value={accNo}
              onChange={(e) => setAccNo(e.target.value)}
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

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Withdrawal History</h2>

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
                      key={log._id}
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
