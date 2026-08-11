import { fetchTaskById } from "@/lib/fetchTasks";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";

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
      return Response.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    // ----------------------------------------
    // 2. MongoDB user must exist
    // ----------------------------------------

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 },
      );
    }

    // ----------------------------------------
    // 3. Get task ID
    // ----------------------------------------

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

    // ----------------------------------------
    // 4. Find task
    // ----------------------------------------

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

    // ----------------------------------------
    // 5. Check cooldown for this task
    // ----------------------------------------

    const existingCooldown =
      user.cooldowns.get(taskId);

    if (
      existingCooldown &&
      existingCooldown.getTime() > Date.now()
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Please wait before starting this task again.",
          cooldownEndsAt: existingCooldown,
        },
        { status: 429 },
      );
    }

    // ----------------------------------------
    // 6. Set new cooldown
    // ----------------------------------------

    const cooldownUntil = new Date(
      Date.now() + 60_000 * 10,
    );

    user.cooldowns.set(
      taskId,
      cooldownUntil,
    );

    user.markModified("cooldowns");

    await user.save();

    // ----------------------------------------
    // 7. Return task
    // ----------------------------------------

    return Response.json({
      success: true,
      message: "Task started successfully.",
      taskUrl: task.link,
      cooldownEndsAt: cooldownUntil,
    });
  } catch (error) {
    console.error(
      "Start Task Error:",
      error,
    );

    return Response.json(
      {
        success: false,
        message: "Internal Server Error.",
      },
      { status: 500 },
    );
  }
}
