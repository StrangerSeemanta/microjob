"use server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { UserDataType } from "@/types/UserData";

export async function fetchUserByClerkId(clerkId: string) {
  await connectDB();
  const user = (await User.findOne({
    clerkId: clerkId,
  })) as unknown as UserDataType;
  return JSON.stringify({
    
    firstName: user.firstName,
    lastName: user.lastName,
    balance: Number(user.balance),
    taskCompleted: Number(user.tasksCompleted),
    email:user.email,
    imageUrl: user.imageUrl,
  });
}
