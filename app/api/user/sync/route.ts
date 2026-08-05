import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST() {
  const clerk = await clerkClient();

  let clerkUser = await currentUser();

  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const adminEmails = ["ronihalderaadi1@gmail.com", "quantamant@gmail.com"];
  const u_email = clerkUser.emailAddresses[0]?.emailAddress;
  if (adminEmails.includes(u_email)) {
    await clerk.users.updateUserMetadata(clerkUser.id, {
      publicMetadata: {
        ...clerkUser.publicMetadata,
        role: "admin",
      },
    });
    clerkUser = await currentUser();
  }

  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await User.updateOne(
    { clerkId: clerkUser.id },
    {
      $set: {
        email: clerkUser.emailAddresses[0]?.emailAddress,
        username: clerkUser.username,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        publicMetadata: {
          role: clerkUser.publicMetadata?.role,
          balance: clerkUser.publicMetadata?.balance,
        },
        role: clerkUser.publicMetadata?.role || "user",
      },
    },
  );

  return NextResponse.json({ success: true });
}
