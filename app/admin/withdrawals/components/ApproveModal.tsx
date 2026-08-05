"use client";

import { useState } from "react";

import type { UseWithdrawalsReturn } from "../hooks/useWithdrawals";

interface Props {
  withdraw: UseWithdrawalsReturn;
}

export default function ApproveModal({ withdraw }: Props) {
  const [transactionId, setTransactionId] = useState("");
  const [disabled, setDisable] = useState(false);
  if (withdraw.modal !== "paid" || !withdraw.selectedWithdrawal) {
    return null;
  }

  async function handleApprove() {
    setDisable(true);
    if (!transactionId.trim()) {
      alert("Transaction ID is required.");
      return;
    }

    const selectedWithdrawal = withdraw.selectedWithdrawal as {
      _id?: { toString(): string } | string;
      id?: { toString(): string } | string;
    };

    const withdrawalId =
      selectedWithdrawal._id?.toString() ?? selectedWithdrawal.id?.toString();

    if (!withdrawalId) {
      alert("Selected withdrawal is invalid.");
      return;
    }

    await withdraw.approve(withdrawalId, transactionId);

    setTransactionId("");

    withdraw.setModal(null);
    setDisable(false);
    withdraw.setSelectedWithdrawal(null);
  }

  function handleClose() {
    setTransactionId("");

    withdraw.setModal(null);

    withdraw.setSelectedWithdrawal(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold">Mark Withdrawal as Paid</h2>

        <div className="mt-6 space-y-3">
          <div>
            <p className="text-sm text-gray-500">User</p>

            <p className="font-medium">{withdraw.selectedWithdrawal.clerkId}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Amount</p>

            <p className="font-semibold">
              ৳{withdraw.selectedWithdrawal.amount.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Account Number</p>

            <p className="font-semibold">
              {withdraw.selectedWithdrawal.accountNumber}
            </p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Transaction ID
            </label>

            <input
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter payment transaction ID"
              className="w-full rounded-lg border px-4 py-2 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={handleClose} className="rounded-lg border px-4 py-2">
            Cancel
          </button>

          <button
            disabled={disabled}
            onClick={handleApprove}
            className="rounded-lg bg-green-600 disabled:bg-slate-600 disabled:pointer-events-none px-5 py-2 text-white hover:bg-green-700"
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
}
