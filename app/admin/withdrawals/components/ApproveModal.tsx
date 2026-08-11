"use client";

import { useState } from "react";

import type { UseWithdrawalsReturn } from "../hooks/useWithdrawals";

interface Props {
  withdraw: UseWithdrawalsReturn;
}

export default function ApproveModal({ withdraw }: Props) {
  const [transactionId, setTransactionId] = useState("");
  const [disabled, setDisabled] = useState(false);

  if (
    withdraw.modal !== "paid" ||
    !withdraw.selectedWithdrawal
  ) {
    return null;
  }

  const withdrawal = withdraw.selectedWithdrawal;

  async function handleApprove() {
    // Validate first
    if (!transactionId.trim()) {
      alert("Transaction ID is required.");
      return;
    }

    // Validate MongoDB withdrawal ID
    if (!withdrawal.id) {
      alert("Selected withdrawal is invalid.");
      return;
    }

    setDisabled(true);

    try {
      await withdraw.approve(
        withdrawal.id,
        transactionId.trim(),
      );

      setTransactionId("");

      withdraw.setModal(null);
      withdraw.setSelectedWithdrawal(null);
    } catch (error) {
      console.error(
        "Failed to approve withdrawal:",
        error,
      );

      alert(
        "Failed to approve withdrawal. Please try again.",
      );
    } finally {
      setDisabled(false);
    }
  }

  function handleClose() {
    if (disabled) return;

    setTransactionId("");
    withdraw.setModal(null);
    withdraw.setSelectedWithdrawal(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}

        <h2 className="text-xl font-semibold">
          Mark Withdrawal as Paid
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Confirm that this withdrawal has been successfully
          paid to the user.
        </p>

        {/* Withdrawal Information */}

        <div className="mt-6 space-y-4">
          {/* User */}

          <div>
            <p className="text-sm text-gray-500">
              User
            </p>

            <div className="mt-1">
              {withdrawal.user ? (
                <>
                  <p className="font-medium">
                    {withdrawal.user.firstName || ""}
                    {" "}
                    {withdrawal.user.lastName || ""}
                  </p>

                  {withdrawal.user.email && (
                    <p className="text-sm text-gray-500">
                      {withdrawal.user.email}
                    </p>
                  )}

                  {withdrawal.user.username && (
                    <p className="text-sm text-gray-500">
                      @{withdrawal.user.username}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-red-500">
                  User information unavailable
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
              ৳{withdrawal.amount.toFixed(2)}
            </p>
          </div>

          {/* Payment Method */}

          <div>
            <p className="text-sm text-gray-500">
              Payment Method
            </p>

            <p className="mt-1 font-medium">
              {withdrawal.paymentMethod}
            </p>
          </div>

          {/* Account Number */}

          <div>
            <p className="text-sm text-gray-500">
              Account Number
            </p>

            <p className="mt-1 font-mono font-semibold">
              {withdrawal.accountNumber}
            </p>
          </div>

          {/* Transaction ID */}

          <div>
            <label
              htmlFor="transactionId"
              className="mb-1 block text-sm font-medium"
            >
              Transaction ID
            </label>

            <input
              id="transactionId"
              value={transactionId}
              onChange={(e) =>
                setTransactionId(e.target.value)
              }
              disabled={disabled}
              placeholder="Enter payment transaction ID"
              className="w-full rounded-lg border px-4 py-2 outline-none transition focus:border-blue-500 disabled:bg-gray-100"
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
            disabled={
              disabled ||
              !transactionId.trim()
            }
            onClick={handleApprove}
            className="rounded-lg bg-green-600 px-5 py-2 text-white transition hover:bg-green-700 disabled:pointer-events-none disabled:bg-slate-400"
          >
            {disabled
              ? "Processing..."
              : "Confirm Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
