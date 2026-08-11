import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";

const TASK_REWARD = 0.2;

export async function POST(req: Request) {
  try {
    // ----------------------------------------
    // 1. Authenticate
    //
    // Supports:
    // - Supabase users
    // - Existing Clerk users
    // ----------------------------------------

    const {
      authenticated,
      user,
    } = await getAuthenticatedUser();

    if (!authenticated) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    // ----------------------------------------
    // 2. MongoDB user must exist
    // ----------------------------------------

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ----------------------------------------
    // 3. Get task ID
    // ----------------------------------------

    const { taskId } = await req.json();

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          message: "Task ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    // ----------------------------------------
    // 4. Calculate reward
    // ----------------------------------------

    const currentBalance =
      Number(user.balance || 0);

    const newBalance =
      currentBalance + TASK_REWARD;

    const newTasksCompleted =
      Number(user.tasksCompleted || 0) + 1;

    // ----------------------------------------
    // 5. Update MongoDB
    // ----------------------------------------

    user.balance = Number(
      newBalance.toFixed(6),
    );

    user.tasksCompleted =
      newTasksCompleted;

    user.markModified("balance");
    user.markModified("tasksCompleted");

    await user.save();

    // ----------------------------------------
    // 6. Return updated data
    // ----------------------------------------

    return NextResponse.json({
      success: true,

      message: "Balance data updated.",

      newBalance: Number(
        newBalance.toFixed(6),
      ),

      tasksCompleted:
        newTasksCompleted,
    });
  } catch (error) {
    console.error(
      "[task/complete] Error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Internal Server Error. Error came from task->complete route.",
      },
      {
        status: 500,
      },
    );
  }
}
