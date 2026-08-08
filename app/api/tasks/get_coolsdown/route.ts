import { auth } from "@clerk/nextjs/server";
import User from "@/models/User";

export async function POST(request: Request) {
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

    const body = await request.json();

    const { taskId } = body;

    if (!taskId || typeof taskId !== "string") {
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
    }).select("cooldowns");

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 },
      );
    }

    const cooldownUntil = user.cooldowns?.get(taskId);

    // No cooldown exists
    if (!cooldownUntil) {
      return Response.json({
        success: true,
        cooldown: false,
        remainingMs: 0,
        cooldownUntil: null,
      });
    }

    const cooldownTime = new Date(cooldownUntil).getTime();
    const remainingMs = cooldownTime - Date.now();

    // Cooldown expired
    if (remainingMs <= 0) {
      return Response.json({
        success: true,
        cooldown: false,
        remainingMs: 0,
        cooldownUntil: null,
      });
    }

    // Cooldown still active
    return Response.json({
      success: true,
      cooldown: true,
      remainingMs,
      cooldownUntil: new Date(cooldownTime).toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch cooldown:", error);

    return Response.json(
      {
        success: false,
        message: "Internal Server Error.",
      },
      { status: 500 },
    );
  }
}