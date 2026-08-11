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
    // - Clerk users
    //
    // Authentication is provider-independent.
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
    // 3. Find withdrawals by MongoDB User._id
    //
    // IMPORTANT:
    //
    // WithdrawalRequest.userId
    //          ↓
    //       User._id
    //
    // No clerkId lookup.
    // No provider-specific logic.
    // ----------------------------------------

    const withdrawals =
      await WithdrawalRequest.find({
        userId: user._id,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    // ----------------------------------------
    // 4. Serialize MongoDB ObjectIds
    //
    // ObjectIds must become strings before
    // they are consumed by the frontend.
    // ----------------------------------------

    const safeWithdrawals =
      withdrawals.map((withdrawal) => ({
        id: withdrawal._id.toString(),

        userId:
          withdrawal.userId.toString(),

        amount:
          withdrawal.amount,

        paymentMethod:
          withdrawal.paymentMethod,

        accountNumber:
          withdrawal.accountNumber,

        accountName:
          withdrawal.accountName,

        status:
          withdrawal.status,

        note:
          withdrawal.note,

        rejectionReason:
          withdrawal.rejectionReason,

        transactionId:
          withdrawal.transactionId,

        reviewedBy:
          withdrawal.reviewedBy,

        reviewedAt:
          withdrawal.reviewedAt
            ? withdrawal.reviewedAt.toISOString()
            : null,

        createdAt:
          withdrawal.createdAt.toISOString(),

        updatedAt:
          withdrawal.updatedAt.toISOString(),
      }));

    // ----------------------------------------
    // 5. Return withdrawal history
    // ----------------------------------------

    return NextResponse.json({
      success: true,
      withdrawals: safeWithdrawals,
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
