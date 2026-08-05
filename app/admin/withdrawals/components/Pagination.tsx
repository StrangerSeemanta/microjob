"use client";

import type { UseWithdrawalsReturn } from "../hooks/useWithdrawals";

interface Props {
  withdraw: UseWithdrawalsReturn;
}

export default function Pagination({ withdraw }: Props) {
  const { page, totalPages, setPage } = withdraw;

  if (totalPages <= 1) {
    return null;
  }

  function previous() {
    if (page > 1) {
      setPage(page - 1);
    }
  }

  function next() {
    if (page < totalPages) {
      setPage(page + 1);
    }
  }

  return (
    <div className="flex items-center justify-between rounded-xl border bg-white px-6 py-4">
      <div className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </div>

      <div className="flex gap-2">
        <button
          onClick={previous}
          disabled={page === 1}
          className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100"
        >
          Previous
        </button>

        <button
          onClick={next}
          disabled={page === totalPages}
          className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100"
        >
          Next
        </button>
      </div>
    </div>
  );
}
