import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";

import WithdrawalRequest from "@/models/WithdrawalRequest";

export async function GET() {
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
          message: "Unauthorized",
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
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }

    // ----------------------------------------
    // 3. Existing withdrawal records still use
    //    clerkId.
    //
    // IMPORTANT:
    //
    // We are intentionally keeping this for
    // emergency compatibility.
    //
    // The authenticated user is resolved by
    // email first.
    //
    // Then their existing clerkId is used only
    // to locate historical withdrawal records.
    // ----------------------------------------

    const withdrawals =
      await WithdrawalRequest.find({
        clerkId: user.clerkId,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    // ----------------------------------------
    // 4. Return withdrawal history
    // ----------------------------------------

    return NextResponse.json({
      success: true,
      withdrawals,
    });
  } catch (error) {
    console.error(
      "GET /api/user/withdrawals error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
