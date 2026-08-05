// lib/getCurrentUser.ts
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "./mongodb";
import User from "@/models/User";

export async function getCurrentUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) return null;

  await connectDB();

  return await User.findOne({
    clerkId: clerkUser.id,
  });
}