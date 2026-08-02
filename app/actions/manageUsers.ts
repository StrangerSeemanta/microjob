"use server";

import { checkUserRole } from "@/utils/roles";
import { clerkClient, auth, type User } from "@clerk/nextjs/server";

export async function setRole(formData: FormData): Promise<User | void> {
  const client = await clerkClient();
  const currentUser = await auth();
  try {
    // Check that the user trying to set the Role is an admin
    if (!checkUserRole("admin")) {
      throw new Error("Not Authorized");
    }

    const userId: string = formData.get("userId") as string;
    const role: string = formData.get("role") as string;

    // prevent removing own admin role
    if (userId === currentUser.userId)
      throw new Error("Cannot change own role");
    const res = await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role,
      },
    });
    return res;
  } catch (err) {
   console.error("Failed to set role: " + String(err));
   return;
  }
}

// remove role
export async function removeRole(formData: FormData): Promise<void | User> {
  const client = await clerkClient();
  const currentUser = await auth();
  try {
    // Check that the user trying to remove the Role is an admin
    if (!checkUserRole("admin")) {
        throw new Error("Not Authorized");
    }

    const userId: string = formData.get("userId") as string;

    // prevent removing own admin role
    if (userId === currentUser.userId)
      throw new Error("Cannot remove own role");

    const res = await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: null,
      },
    });
    return res;
  } catch (err) {
    // throw new Error("Failed to remove role: " + String(err));
    console.error("Failed to remove role: " + String(err));
    return;
  }
}
