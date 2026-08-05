"use client";

import { useState } from "react";

import type { UseWithdrawalsReturn } from "../hooks/useWithdrawals";
import { toast } from "@/components/ui/toast";

interface Props {
  withdraw: UseWithdrawalsReturn;
}

export default function RejectModal({ withdraw }: Props) {
  const [reason, setReason] = useState("");

  if (withdraw.modal !== "rejected" || !withdraw.selectedWithdrawal) {
    return null;
  }

  // From this point onward, TypeScript knows it's non-null.
  const selected = withdraw.selectedWithdrawal;

  async function handleReject() {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      toast.add({ title: "Please provide a rejection reason." });
      return;
    }

    if (!selected._id) {
      toast.add({ title: "Missing withdrawal ID." });
      return;
    }

    await withdraw.reject(String(selected._id), trimmedReason);

    setReason("");

    withdraw.setModal(null);
    withdraw.setSelectedWithdrawal(null);
  }

  function handleClose() {
    setReason("");

    withdraw.setModal(null);
    withdraw.setSelectedWithdrawal(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold text-red-600">
          Reject Withdrawal
        </h2>

        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm text-gray-500">User</p>

            <p className="font-medium">{selected.clerkId}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Amount</p>

            <p className="font-semibold">৳{selected.amount.toFixed(2)}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Rejection Reason
            </label>

            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this withdrawal is rejected..."
              className="w-full rounded-lg border px-4 py-2 outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={handleClose} className="rounded-lg border px-4 py-2">
            Cancel
          </button>

          <button
            onClick={handleReject}
            className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
          >
            Reject Withdrawal
          </button>
        </div>
      </div>
    </div>
  );
}
