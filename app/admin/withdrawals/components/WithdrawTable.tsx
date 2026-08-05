"use client";

import type { UseWithdrawalsReturn } from "../hooks/useWithdrawals";

import WithdrawRow from "./WithdrawRow";

interface Props {
  withdraw: UseWithdrawalsReturn;
}

export default function WithdrawTable({ withdraw }: Props) {
  if (withdraw.loading) {
    return (
      <div className="rounded-xl border bg-white p-12 text-center">
        <div className="text-gray-500">Loading withdrawal requests...</div>
      </div>
    );
  }

  if (withdraw.withdrawals.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-12 text-center">
        <h2 className="text-lg font-semibold">No Withdrawal Requests</h2>

        <p className="mt-2 text-gray-500">
          There are no withdrawal requests matching your current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                User
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Amount
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Method
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Account
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Date
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Status
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {withdraw.withdrawals.map((item) => (
              <WithdrawRow
                key={String(item.clerkId)}
                withdrawal={item}
                withdraw={withdraw}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
