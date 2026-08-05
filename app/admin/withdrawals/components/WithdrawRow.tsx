"use client";

import StatusBadge from "@/components/ui/StatusBadge";
import type { Withdrawal } from "../hooks/useWithdrawals";
import type { UseWithdrawalsReturn } from "../hooks/useWithdrawals";
import { useEffect, useState } from "react";
import { UserDataType } from "@/types/UserData";
import { Loader } from "lucide-react";
import { fetchUserByClerkId } from "@/app/actions/fetchUserById";
import Image from "next/image";

interface Props {
  withdrawal: Withdrawal;
  withdraw: UseWithdrawalsReturn;
}

export default function WithdrawRow({ withdrawal, withdraw }: Props) {
  const [user, setUser] = useState<{
    firstName: string;
    lastName: string;
    balance: number;
    taskCompleted: number;
    imageUrl: string;
    email: string;
  } | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      try {
        const userDataStr = await fetchUserByClerkId(withdrawal.clerkId);
        const userData = JSON.parse(userDataStr) as unknown as {
          firstName: string;
          lastName: string;
          balance: number;
          taskCompleted: number;
          imageUrl: string;
          email:string;
        };
        if (isMounted) {
          setUser(userData);
          setLoadingUser(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);

        if (isMounted) {
          setLoadingUser(false);
        }
      }
    };

    void loadUserData();

    return () => {
      isMounted = false;
    };
  }, [withdrawal.clerkId]);

  return (
    <tr className="border-b hover:bg-gray-50 transition">
      {/* User */}

      <td className="px-6 py-4">
        {loadingUser ? (
          <>
            <div>
              <Loader className="animate-spin" />
            </div>
          </>
        ) : (
          user && (
            <div>
              <div className="flex justify-start items-center flex-wrap">
                <Image
                  src={user.imageUrl}
                  width={40}
                  height={40}
                  alt="image"
                  className="rounded-full mr-2"
                />
                <p className="font-medium text-sm">
                  {user.firstName} {user.lastName}
                </p>
              </div>

              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          )
        )}
      </td>

      {/* Amount */}

      <td className="px-6 py-4 font-semibold">
        ৳{withdrawal.amount.toFixed(2)}
      </td>

      {/* Method */}

      <td className="px-6 py-4">{withdrawal.paymentMethod}</td>

      {/* Account */}

      <td className="px-6 py-4">
        <button
          className="font-mono hover:underline"
          onClick={() =>
            navigator.clipboard.writeText(withdrawal.accountNumber)
          }
        >
          {withdrawal.accountNumber}
        </button>
      </td>

      {/* Date */}

      <td className="px-6 py-4">
        {new Date(withdrawal.createdAt).toLocaleDateString()}
      </td>

      {/* Status */}

      <td className="px-6 py-4">
        <StatusBadge status={withdrawal.status} />
      </td>

      {/* Actions */}

      <td className="px-6 py-4">
        {withdrawal.status === "pending" && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                withdraw.setSelectedWithdrawal(withdrawal);

                withdraw.setModal("paid");
              }}
              className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
            >
              Paid
            </button>

            <button
              onClick={() => {
                withdraw.setSelectedWithdrawal(withdrawal);

                withdraw.setModal("rejected");
              }}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
