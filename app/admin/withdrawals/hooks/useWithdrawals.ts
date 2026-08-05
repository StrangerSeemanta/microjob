"use client";

import { useCallback, useEffect, useState } from "react";

import { getAdminWithdrawals, updateWithdrawal } from "@/lib/api/withdraw";
import { WithdrawalRequestSchemaType } from "@/models/WithdrawalRequest";
export type Withdrawal = WithdrawalRequestSchemaType;

export function useWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<Withdrawal | null>(null);

  const [modal, setModal] = useState<null | "paid" | "rejected">(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [status, setStatus] = useState("");

  const [search, setSearch] = useState("");

  //------------------------------------

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const res = await getAdminWithdrawals(page, status, search);

      if (res.success) {
        setWithdrawals(res.withdrawals);

        setTotalPages(res.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  //------------------------------------

  const triggerLoad = useCallback(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timeoutId = window.setTimeout(triggerLoad, 0);

    return () => window.clearTimeout(timeoutId);
  }, [triggerLoad]);

  //------------------------------------

  async function approve(
    id: string,

    transactionId: string,
  ) {
    await updateWithdrawal(
      id,

      "paid",

      {
        transactionId,
      },
    );

    load();
  }

  //------------------------------------

  async function reject(
    id: string,

    reason: string,
  ) {
    await updateWithdrawal(
      id,

      "rejected",

      {
        rejectionReason: reason,
      },
    );

    load();
  }

  //------------------------------------

  return {
    withdrawals,
    selectedWithdrawal,
    setSelectedWithdrawal,

    modal,
    setModal,
    loading,

    page,

    setPage,

    totalPages,

    status,

    setStatus,

    search,

    setSearch,

    reload: load,

    approve,

    reject,
  };
}
export type UseWithdrawalsReturn = ReturnType<typeof useWithdrawals>;
