import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";

import { connectDB } from "@/lib/mongodb";

import WithdrawalRequest from "@/models/WithdrawalRequest";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

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
        { status: 401 },
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
        { status: 404 },
      );
    }

    // ----------------------------------------
    // 3. Get withdrawal data
    // ----------------------------------------

    const {
      amount,
      paymentMethod,
      accountNumber,
      accountName,
    } = await req.json();

    // ----------------------------------------
    // 4. Basic validation
    // ----------------------------------------

    if (
      amount === undefined ||
      amount === null ||
      !paymentMethod ||
      !accountNumber
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields.",
        },
        { status: 400 },
      );
    }

    const withdrawalAmount =
      Number(amount);

    if (
      !Number.isFinite(withdrawalAmount) ||
      withdrawalAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid withdrawal amount.",
        },
        { status: 400 },
      );
    }

    // ----------------------------------------
    // 5. Balance check
    // ----------------------------------------

    if (
      Number(user.balance || 0) <
      withdrawalAmount
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient balance.",
        },
        { status: 400 },
      );
    }

    // ----------------------------------------
    // 6. Create withdrawal request
    //
    // IMPORTANT:
    //
    // userId = MongoDB users.data _id
    //
    // clerkId = kept temporarily for compatibility
    // with your existing withdrawal/admin system.
    // ----------------------------------------

    const withdrawal =
      await WithdrawalRequest.create({
        userId: user._id,

        // Keep the existing Clerk ID on the
        // withdrawal document so old admin
        // functionality and historical records
        // continue working.
        clerkId: user.clerkId,

        amount: withdrawalAmount,

        paymentMethod,

        accountNumber,

        accountName,

        status: "pending",
      });

    // ----------------------------------------
    // 7. Deduct balance
    // ----------------------------------------

    user.balance =
      Number(user.balance || 0) -
      withdrawalAmount;

    user.pending =
      Number(user.pending || 0) +
      withdrawalAmount;

    user.markModified("balance");
    user.markModified("pending");

    await user.save();

    // ----------------------------------------
    // 8. Return safe response
    // ----------------------------------------

    return NextResponse.json({
      success: true,

      message:
        "Withdrawal request submitted.",

      withdrawal: {
        id: withdrawal._id.toString(),

        userId:
          withdrawal.userId?.toString(),

        clerkId:
          withdrawal.clerkId,

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

        createdAt:
          withdrawal.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "POST /api/withdraw error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
