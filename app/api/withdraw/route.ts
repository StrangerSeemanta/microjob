import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import WithdrawalRequest from "@/models/WithdrawalRequest";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  const session = await mongoose.startSession();

  try {
    await connectDB();

    // ----------------------------------------
    // 1. Authenticate
    //
    // Supports:
    // - Supabase
    // - Clerk
    // ----------------------------------------

    const { authenticated, user } = await getAuthenticatedUser();

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
    // 3. Read request body
    // ----------------------------------------

    const body = await req.json();

    const { amount, paymentMethod, accountNumber, accountName } = body;

    // ----------------------------------------
    // 4. Validate required fields
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

    // ----------------------------------------
    // 5. Validate amount
    // ----------------------------------------

    const withdrawalAmount = Number(amount);

    if (!Number.isFinite(withdrawalAmount) || withdrawalAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid withdrawal amount.",
        },
        { status: 400 },
      );
    }

    // ----------------------------------------
    // 6. Start MongoDB transaction
    // ----------------------------------------

    session.startTransaction();

    // ----------------------------------------
    // 7. Atomically deduct balance
    //
    // This prevents two simultaneous requests
    // from withdrawing the same balance.
    // ----------------------------------------

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: user._id,

        // Important:
        // Only update if enough balance exists.
        balance: {
          $gte: withdrawalAmount,
        },
      },
      {
        $inc: {
          balance: -withdrawalAmount,
          pending: withdrawalAmount,
        },
      },
      {
        new: true,
        session,
      },
    );

    if (!updatedUser) {
      await session.abortTransaction();

      return NextResponse.json(
        {
          success: false,
          message: "Insufficient balance.",
        },
        { status: 400 },
      );
    }

    // ----------------------------------------
    // 8. Create withdrawal request
    //
    // IMPORTANT:
    //
    // Only MongoDB User._id is stored.
    //
    // No clerkId.
    // No Supabase ID.
    // ----------------------------------------

    const withdrawal = await WithdrawalRequest.create(
      [
        {
          userId: user._id,

          amount: withdrawalAmount,

          paymentMethod: paymentMethod.toString().trim(),

          accountNumber: accountNumber.toString().trim(),

          accountName: accountName ? accountName.toString().trim() : "",

          status: "pending",
        },
      ],
      {
        session,
      },
    );

    // ----------------------------------------
    // 9. Commit transaction
    // ----------------------------------------

    await session.commitTransaction();

    const createdWithdrawal = withdrawal[0];

    // ----------------------------------------
    // 10. Return frontend-safe data
    // ----------------------------------------

    return NextResponse.json({
      success: true,

      message: "Withdrawal request submitted.",

      withdrawal: {
        id: createdWithdrawal._id.toString(),

        userId: createdWithdrawal.userId.toString(),

        amount: createdWithdrawal.amount,

        paymentMethod: createdWithdrawal.paymentMethod,

        accountNumber: createdWithdrawal.accountNumber,

        accountName: createdWithdrawal.accountName,

        status: createdWithdrawal.status,

        createdAt: createdWithdrawal.createdAt,
      },
    });
  } catch (error) {
    // ----------------------------------------
    // Rollback transaction
    // ----------------------------------------

    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error("POST /api/withdraw error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  } finally {
    await session.endSession();
  }
}
