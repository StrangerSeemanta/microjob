"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getAdminWithdrawals,
  updateWithdrawal,
  type AdminWithdrawal,
} from "@/lib/api/withdraw";

export type Withdrawal = AdminWithdrawal;

export function useWithdrawals() {
  const [withdrawals, setWithdrawals] =
    useState<Withdrawal[]>([]);

  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<Withdrawal | null>(null);

  const [modal, setModal] =
    useState<null | "paid" | "rejected">(null);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [status, setStatus] = useState("");

  const [search, setSearch] = useState("");

  // ================================================
  // LOAD
  // ================================================

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const res = await getAdminWithdrawals(
        page,
        status,
        search,
      );

      if (!res.success) {
        console.error(
          "Failed to load withdrawals:",
          res.message,
        );

        setWithdrawals([]);
        setTotalPages(1);

        return;
      }

      setWithdrawals(res.withdrawals);

      setTotalPages(
        res.totalPages > 0
          ? res.totalPages
          : 1,
      );
    } catch (error) {
      console.error(
        "Failed to load withdrawals:",
        error,
      );

      setWithdrawals([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  // ================================================
  // LOAD WHEN FILTER/PAGE CHANGES
  // ================================================

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [load]);

  // ================================================
  // APPROVE
  // ================================================

  const approve = useCallback(
    async (
      id: string,
      transactionId: string,
    ) => {
      const result = await updateWithdrawal(
        id,
        "paid",
        {
          transactionId,
        },
      );

      if (!result.success) {
        throw new Error(
          result.message ||
            "Failed to approve withdrawal.",
        );
      }

      setModal(null);
      setSelectedWithdrawal(null);

      await load();

      return result;
    },
    [load],
  );

  // ================================================
  // REJECT
  // ================================================

  const reject = useCallback(
    async (
      id: string,
      reason: string,
    ) => {
      const result = await updateWithdrawal(
        id,
        "rejected",
        {
          rejectionReason: reason,
        },
      );

      if (!result.success) {
        throw new Error(
          result.message ||
            "Failed to reject withdrawal.",
        );
      }

      setModal(null);
      setSelectedWithdrawal(null);

      await load();

      return result;
    },
    [load],
  );

  // ================================================
  // RETURN
  // ================================================

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

export type UseWithdrawalsReturn =
  ReturnType<typeof useWithdrawals>;