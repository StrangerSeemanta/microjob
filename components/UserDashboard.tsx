
import { SignOutButton, UserAvatar, useUser } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

function UserDashboard() {
  const { user, isLoaded } = useUser();
  const role =
    typeof user?.publicMetadata?.role === "string"
      ? user.publicMetadata.role
      : "N/A";

  return (
    <div className="p-4">
      <div className="w-full h-[40vh] bg-gray-500 rounded-lg flex justify-between items-center p-4">
        {isLoaded && user && (
          <div className="flex items-center gap-4">
            <UserAvatar />
            <div>
              <h2 className="text-lg font-semibold">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-gray-300">
                {user.emailAddresses[0].emailAddress}
              </p>
              <p className="text-lg text-yellow-300 p-3 border-2 border-yellow-300 rounded-lg my-3">
                Role: {role}
              </p>
            </div>
          </div>
        )}
        <SignOutButton>
          <button className="ml-4 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
            Logout
          </button>
        </SignOutButton>
      </div>

      {/* Options */}
      <div className="mt-4 flex flex-wrap justify-center items-center gap-2">
        {role === "admin" && (
          <Link
            href="/admin"
          className="rounded flex-1 bg-blue-600 px-20 py-20 text-sm font-medium text-white hover:bg-blue-700"
          >
            Admin Panel
          </Link>
        )}
        <Link
          href="/tasks"
          className="rounded flex-1 bg-blue-600 px-20 py-20 text-sm font-medium text-white hover:bg-blue-700"
        >
          Tasks
        </Link>
        <Link
          href="/profile"
          className="rounded flex-1 bg-red-600 px-20 py-20 text-sm font-medium text-white hover:bg-blue-700"
        >
          Profile
        </Link>
        <Link
          href="/settings"
          className="rounded flex-1 bg-green-600 px-20 py-20 text-sm font-medium text-white hover:bg-blue-700"
        >
          Settings
        </Link>
      </div>
    </div>
  );
}

export default UserDashboard;
