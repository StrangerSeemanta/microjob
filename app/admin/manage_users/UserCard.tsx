"use client";

import React, { useEffect, useState } from "react";
import DeleteUserBtn from "./DeleteUserBtn";
import Image from "next/image";
import { UserDataType } from "@/types/UserData";
import { formatCurrency } from "@/utils/formatCurrency";
import { fetchUserByClerkId } from "@/app/actions/fetchUserById";

function UserCard({ clerkUserId }: { clerkUserId: string }) {
  const [user, setCurrUser] = useState<UserDataType | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      try {
        const userDataStr = await fetchUserByClerkId(clerkUserId);
        const userData = JSON.parse(userDataStr) as unknown as UserDataType;
        if (isMounted) {
          setCurrUser(userData);
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
  }, [clerkUserId]);
  return (
    <>
      {user ? (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
          <div className="flex justify-between items-center">
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <Image
                  src={user.imageUrl||""}
                  alt="User Image"
                  width={32}
                  height={32}
                  className="rounded-full w-8 h-8 "
                />
                <p className="text-sm font-medium text-slate-900">
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-1">{user.clerkId}</p>
              <p className="text-xs text-slate-500 mt-1">
                {user.emailAddresses[0]?.emailAddress}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {user.publicMetadata.phone
                  ? String(user.publicMetadata.phone)
                  : ""}
              </p>
            </div>
            <h1 className="text-xs text-slate-500 mt-1">
              {formatCurrency(Number(current_user.balance))}
            </h1>
          </div>

          <div className="mb-3 py-2 border-t border-b border-slate-200">
            <p className="text-xs text-slate-600">
              Role:{" "}
              <span className="font-medium bg-black text-white px-2 py-[0.25px] rounded-lg text-xs capitalize">
                {user.publicMetadata.role
                  ? String(user.publicMetadata.role)
                  : "User"}
              </span>
            </p>
          </div>

          {/* Role buttons */}
          <DeleteUserBtn userId={user.id} />
        </div>
      ) : (
        <div>User Data not found</div>
      )}
    </>
  );
}

export default UserCard;
