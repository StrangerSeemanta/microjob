"use client";

import { useState } from "react";

import { toast } from "@/components/ui/toast";
import type { UseWithdrawalsReturn } from "../hooks/useWithdrawals";

interface Props {
  withdraw: UseWithdrawalsReturn;
}

export default function RejectModal({ withdraw }: Props) {
  const [reason, setReason] = useState("");
  const [disabled, setDisabled] = useState(false);

  if (
    withdraw.modal !== "rejected" ||
    !withdraw.selectedWithdrawal
  ) {
    return null;
  }

  const selected = withdraw.selectedWithdrawal;

  const user = selected.user;

  const displayName =
    user?.firstName || user?.lastName
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
      : user?.username || "Unknown User";

  async function handleReject() {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      toast.add({
        title: "Please provide a rejection reason.",
      });
      return;
    }

    if (!selected.id) {
      toast.add({
        title: "Missing withdrawal ID.",
      });
      return;
    }

    setDisabled(true);

    try {
      await withdraw.reject(
        selected.id,
        trimmedReason,
      );

      setReason("");

      withdraw.setModal(null);
      withdraw.setSelectedWithdrawal(null);
    } catch (error) {
      console.error(
        "Failed to reject withdrawal:",
        error,
      );

      toast.add({
        title:
          "Failed to reject withdrawal. Please try again.",
      });
    } finally {
      setDisabled(false);
    }
  }

  function handleClose() {
    if (disabled) return;

    setReason("");

    withdraw.setModal(null);
    withdraw.setSelectedWithdrawal(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}

        <h2 className="text-xl font-semibold text-red-600">
          Reject Withdrawal
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Reject this withdrawal request and return the
          amount to the {`user's`} balance.
        </p>

        {/* Withdrawal Information */}

        <div className="mt-6 space-y-4">
          {/* User */}

          <div>
            <p className="text-sm text-gray-500">
              User
            </p>

            <div className="mt-1">
              <p className="font-medium">
                {displayName}
              </p>

              {user?.email && (
                <p className="text-sm text-gray-500">
                  {user.email}
                </p>
              )}
            </div>
          </div>

          {/* Amount */}

          <div>
            <p className="text-sm text-gray-500">
              Amount
            </p>

            <p className="mt-1 font-semibold">
              ৳{Number(selected.amount).toFixed(2)}
            </p>
          </div>

          {/* Payment Method */}

          <div>
            <p className="text-sm text-gray-500">
              Payment Method
            </p>

            <p className="mt-1 font-medium">
              {selected.paymentMethod}
            </p>
          </div>

          {/* Account */}

          <div>
            <p className="text-sm text-gray-500">
              Account Number
            </p>

            <p className="mt-1 font-mono font-semibold">
              {selected.accountNumber}
            </p>
          </div>

          {/* Rejection Reason */}

          <div>
            <label
              htmlFor="rejectionReason"
              className="mb-1 block text-sm font-medium"
            >
              Rejection Reason
            </label>

            <textarea
              id="rejectionReason"
              rows={4}
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              disabled={disabled}
              placeholder="Explain why this withdrawal is rejected..."
              className="w-full resize-none rounded-lg border px-4 py-2 outline-none transition focus:border-red-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Actions */}

        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={disabled}
            className="rounded-lg border px-4 py-2 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleReject}
            disabled={
              disabled ||
              !reason.trim()
            }
            className="rounded-lg bg-red-600 px-5 py-2 text-white transition hover:bg-red-700 disabled:pointer-events-none disabled:bg-slate-400"
          >
            {disabled
              ? "Rejecting..."
              : "Reject Withdrawal"}
          </button>
        </div>
      </div>
    </div>
  );
}
