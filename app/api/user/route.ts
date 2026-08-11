import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";

export async function GET() {
  try {
    // -----------------------------------------
    // 1. Get authenticated user
    //
    // Supports:
    // - Supabase
    // - Existing Clerk users
    // -----------------------------------------

    const {
      authenticated,
      user,
      provider,
    } = await getAuthenticatedUser();

    if (!authenticated) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    // -----------------------------------------
    // 2. MongoDB user not found
    // -----------------------------------------

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    // -----------------------------------------
    // 3. Convert MongoDB document to plain object
    // -----------------------------------------

    const userData = user.toObject();

    // -----------------------------------------
    // 4. Return unified user data
    // -----------------------------------------

    return NextResponse.json({
      success: true,

      // Useful for debugging / frontend logic.
      // Either "supabase" or "clerk".
      provider,

      id: userData._id.toString(),

      // Keep this for backward compatibility.
      //
      // Existing Clerk users will have this.
      // Supabase-created users may have null/undefined.
      //
      // This is NOT used to authenticate the request.
      clerkId: userData.clerkId ?? null,

      email: userData.email ?? null,
      phone: userData.phone ?? null,

      username: userData.username ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      imageUrl: userData.imageUrl ?? null,

      publicMetadata: userData.publicMetadata ?? null,

      balance: Number(userData.balance ?? 0),
      pending: Number(userData.pending ?? 0),
      totalEarned: Number(userData.totalEarned ?? 0),

      paymentPending: Number(
        userData.paymentPending ?? 0,
      ),

      paymentReceived: Number(
        userData.paymentReceived ?? 0,
      ),

      tasksCompleted: Number(
        userData.tasksCompleted ?? 0,
      ),

      role:
        userData.role ??
        userData.publicMetadata?.role ??
        "user",

      cooldowns: userData.cooldowns ?? {},

      referralId: userData.referralId ?? null,
      referredBy: userData.referredBy ?? null,

      referralCount: Number(
        userData.referralCount ?? 0,
      ),

      createdAt: userData.createdAt ?? null,
      updatedAt: userData.updatedAt ?? null,
    });
  } catch (error) {
    console.error(
      "GET /api/user error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user",
      },
      {
        status: 500,
      },
    );
  }
}
