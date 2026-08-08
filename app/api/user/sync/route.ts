import { clerkClient, currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST() {
  try {
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
      return NextResponse.json(
        { error: "Unauthorized, clerkUser not found" },
        { status: 401 },
      );
    }
    const userData_db = await User.findOne({
      clerkId: clerkUser.id,
    });
    await clerk.users.updateUserMetadata(clerkUser.id, {
      publicMetadata: {
        tasksCompleted: userData_db.tasksCompleted,
      },
    });
    clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: "Unauthorized, clerkUser not found" },
        { status: 401 },
      );
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
            taskCompleted: clerkUser.publicMetadata?.tasksCompleted,
          },
          role: clerkUser.publicMetadata?.role || "user",
        },
      },
    );

    return NextResponse.json({ success: true, message: "Successfully synced" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: `Failed To sync ${String(error)}`,
    });
  }
}
