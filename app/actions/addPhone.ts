"use server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { clerkClient, currentUser } from "@clerk/nextjs/server";

export async function addPhoneNumber(formData: FormData) {
  const phonenumber = formData.get("phone")?.toString().trim();
  if (!phonenumber) {
    throw new Error("Missing required fields = Phone number");
  }
  const clerk = await clerkClient();
  const cl_user = await currentUser();
  if (!cl_user || !clerk) {
    return {
      success: false,
      message: "Failed to add phone number cause: can't find clerk user",
    };
  }
  await connectDB();
  await User.findOneAndUpdate(
    { clerkId: cl_user.id },
    {
      $set: { phone: phonenumber },
    },
    { new: true },
  );
  await clerk.users.updateUserMetadata(cl_user.id, {
    publicMetadata: {
      phone: phonenumber,
    },
  });
  return {
    success: true,
    message: "phone number added successfully",
  };
}
