import User from "@/models/User";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const TASK_REWARD = 0.2;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    const { taskId } = await req.json();

    if (!taskId) {
      return Response.json(
        {
          success: false,
          message: "Task ID is required.",
        },
        { status: 400 },
      );
    }

    const user = await User.findOne({
      clerkId: userId,
    });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 },
      );
    }

    const newBalance = user.balance + TASK_REWARD;
    user.balance = newBalance.toFixed(6);
    user.markModified("balance");
    const newTasksCompleted = user.tasksCompleted + 1;
    user.tasksCompleted = newTasksCompleted;
    user.markModified("tasksCompleted");

    await user.save();
    const clerk = await clerkClient();
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        balance: newBalance.toFixed(6),
        tasksCompleted: newTasksCompleted,
      },
    });
    return NextResponse.json({
      success: true,
      message: "Balance Data Updated",
      newBalance: newBalance,
    });
  } catch (error) {
    console.error("[task/complete]-> Start Task Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error. Error Came from task->complete route",
      },
      { status: 500 },
    );
  }
  // TODO: Move reward logic to a "Complete Task" endpoint.
}
