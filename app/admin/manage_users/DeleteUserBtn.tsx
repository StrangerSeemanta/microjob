"use client";

import { toast } from "@/components/ui/toast";
import React, { useState } from "react";

function DeleteUserBtn({ userId }: { userId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteUser(user_id: string) {
    setIsDeleting(true);

    try {
      const response = await fetch("/api/user/deleteuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user_id }),
      });

      if (!response.ok) {
        console.error("Failed to delete user", response.status);
        toast.add({
          type: "error",
          title: "Failed to delete user",
        });
      } else {
        toast.add({
          type: "success",
          title: "Successfully deleted user",
        });
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => deleteUser(userId)}
        disabled={isDeleting}
        className="inline-flex items-center justify-center rounded-md border border-red-600 bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isDeleting ? "Deleting..." : "Delete user"}
      </button>
    </>
  );
}

export default DeleteUserBtn;
