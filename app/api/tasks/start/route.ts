import { auth } from "@clerk/nextjs/server";
import { fetchTaskById } from "@/lib/fetchTasks";
import User from "@/models/User";

export async function POST(req: Request) {
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

    const task = await fetchTaskById(taskId);

    if (!task) {
      return Response.json(
        {
          success: false,
          message: `No task found with ID: ${taskId}`,
        },
        { status: 404 },
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

    // Check cooldown for this task
    const existingCooldown = user.cooldowns.get(taskId);

    if (existingCooldown && existingCooldown.getTime() > Date.now()) {
      return Response.json(
        {
          success: false,
          message: "Please wait before starting this task again.",
          cooldownEndsAt: existingCooldown,
        },
        { status: 429 },
      );
    }

    // Set new cooldown (10 miniutes)
    const cooldownUntil = new Date(Date.now() + 60_000 * 10 );

    user.cooldowns.set(taskId, cooldownUntil);
    user.markModified("cooldowns");

    await user.save();

    return Response.json({
      success: true,
      message: "Task started successfully.",
      taskUrl: task.link,
      cooldownEndsAt: cooldownUntil,
    });
  } catch (error) {
    console.error("Start Task Error:", error);

    return Response.json(
      {
        success: false,
        message: "Internal Server Error.",
      },
      { status: 500 },
    );
  }
}
