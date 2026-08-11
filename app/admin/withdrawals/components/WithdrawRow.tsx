/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import { Clipboard } from "lucide-react";

import StatusBadge from "@/components/ui/StatusBadge";

import type { AdminWithdrawal } from "@/lib/api/withdraw";
import type { UseWithdrawalsReturn } from "../hooks/useWithdrawals";

interface Props {
  withdrawal: AdminWithdrawal;
  withdraw: UseWithdrawalsReturn;
}

export default function WithdrawRow({
  withdrawal,
  withdraw,
}: Props) {
  const user = withdrawal.user;

  const displayName =
    user?.firstName || user?.lastName
      ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
      : user?.username || "Unknown User";

  async function copyAccountNumber() {
    try {
      await navigator.clipboard.writeText(
        withdrawal.accountNumber,
      );
    } catch (error) {
      console.error(
        "Failed to copy account number:",
        error,
      );
    }
  }

  return (
    <tr className="border-b transition hover:bg-gray-50">
      {/* ---------------------------------------- */}
      {/* User */}
      {/* ---------------------------------------- */}

      <td className="px-6 py-4">
        {!user ? (
          <div className="text-sm text-gray-400">
            User unavailable
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  width={40}
                  height={40}
                  alt={displayName}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-600">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <p className="text-sm font-medium">
                {displayName}
              </p>
            </div>

            {user.email && (
              <p className="mt-1 text-sm text-gray-500">
                {user.email}
              </p>
            )}
          </div>
        )}
      </td>

      {/* ---------------------------------------- */}
      {/* Amount */}
      {/* ---------------------------------------- */}

      <td className="px-6 py-4 font-semibold">
        ৳{Number(withdrawal.amount).toFixed(2)}
      </td>

      {/* ---------------------------------------- */}
      {/* Payment Method */}
      {/* ---------------------------------------- */}

      <td className="px-6 py-4">
        {withdrawal.paymentMethod}
      </td>

      {/* ---------------------------------------- */}
      {/* Account */}
      {/* ---------------------------------------- */}

      <td className="px-6 py-4">
        <button
          type="button"
          onClick={copyAccountNumber}
          title="Copy account number"
          className="flex items-center gap-2 font-mono text-sm hover:underline"
        >
          <span>{withdrawal.accountNumber}</span>

          <Clipboard className="h-4 w-4 text-gray-400" />
        </button>
      </td>

      {/* ---------------------------------------- */}
      {/* Date */}
      {/* ---------------------------------------- */}

      <td className="px-6 py-4 text-sm">
        {new Date(
          withdrawal.createdAt,
        ).toLocaleDateString()}
      </td>

      {/* ---------------------------------------- */}
      {/* Status */}
      {/* ---------------------------------------- */}

      <td className="px-6 py-4">
        <StatusBadge status={withdrawal.status} />
      </td>

      {/* ---------------------------------------- */}
      {/* Actions */}
      {/* ---------------------------------------- */}

      <td className="px-6 py-4">
        {withdrawal.status === "pending" && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                withdraw.setSelectedWithdrawal(
                  withdrawal,
                );

                withdraw.setModal("paid");
              }}
              className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-700"
            >
              Paid
            </button>

            <button
              type="button"
              onClick={() => {
                withdraw.setSelectedWithdrawal(
                  withdrawal,
                );

                withdraw.setModal("rejected");
              }}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
