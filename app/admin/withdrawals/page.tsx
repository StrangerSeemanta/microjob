"use client";

import ApproveModal from "./components/ApproveModal";
import Pagination from "./components/Pagination";
import RejectModal from "./components/RejectModal";
import WithdrawTable from "./components/WithdrawTable";
import WithdrawToolbar from "./components/WithdrawToolbar";

import { useWithdrawals } from "./hooks/useWithdrawals";

export default function WithdrawalsPage() {
  const withdraw = useWithdrawals();

  return (
    <>
      <div className="space-y-6">
        <WithdrawToolbar withdraw={withdraw} />

        <WithdrawTable withdraw={withdraw} />

        <Pagination withdraw={withdraw} />
      </div>

      <ApproveModal withdraw={withdraw} />

      <RejectModal withdraw={withdraw} />
    </>
  );
}
