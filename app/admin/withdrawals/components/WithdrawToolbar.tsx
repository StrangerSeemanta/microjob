"use client";

import { useEffect, useState } from "react";
import { UseWithdrawalsReturn } from "../hooks/useWithdrawals";

interface Props {
  withdraw: UseWithdrawalsReturn;
}

export default function WithdrawToolbar({
  withdraw,
}: Props) {
  const [searchInput, setSearchInput] = useState(
    withdraw.search
  );

  //------------------------------------------
  // Debounce Search
  //------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => {
      withdraw.setSearch(searchInput);
      withdraw.setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput,withdraw]);

  //------------------------------------------

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">

      {/* Left */}

      <div>

        <h1 className="text-2xl font-bold">

          Withdrawal Requests

        </h1>

        <p className="text-sm text-gray-500">

          Review and process user withdrawals

        </p>

      </div>

      {/* Right */}

      <div className="flex flex-col gap-3 md:flex-row">

        <input
          value={searchInput}
          onChange={(e) =>
            setSearchInput(e.target.value)
          }
          placeholder="Search username or email..."
          className="w-72 rounded-lg border px-4 py-2 outline-none focus:border-blue-500"
        />

        <select
          value={withdraw.status}
          onChange={(e) => {
            withdraw.setStatus(e.target.value);
            withdraw.setPage(1);
          }}
          className="rounded-lg border px-4 py-2"
        >
          <option value="">
            All Status
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="paid">
            Paid
          </option>

          <option value="rejected">
            Rejected
          </option>
        </select>

        <button
          onClick={withdraw.reload}
          disabled={withdraw.loading}
          className="rounded-lg bg-black px-5 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {withdraw.loading
            ? "Loading..."
            : "Refresh"}
        </button>

      </div>

    </div>
  );
}