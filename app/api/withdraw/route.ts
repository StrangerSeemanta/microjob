import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { connectDB } from "@/lib/mongodb";

import User from "@/models/User";
import WithdrawalRequest from "@/models/WithdrawalRequest";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const { amount, paymentMethod, accountNumber, accountName } =
      await req.json();

    //---------------------------------------
    // Basic Validation
    //---------------------------------------

    if (!amount || !paymentMethod || !accountNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing required fields.",
        },
        { status: 400 },
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid withdrawal amount.",
        },
        { status: 400 },
      );
    }

    //---------------------------------------
    // Find User
    //---------------------------------------

    const user = await User.findOne({ clerkId });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 },
      );
    }

    //---------------------------------------
    // Balance Check
    //---------------------------------------

    if (user.balance < amount) {
      return NextResponse.json(
        {
          success: false,
          message: "Insufficient balance.",
        },
        { status: 400 },
      );
    }

    //---------------------------------------
    // Deduct Balance
    //---------------------------------------

    //---------------------------------------
    // Create Request
    //---------------------------------------
    const withdrawal = await WithdrawalRequest.create({
      userId: user._id,
      clerkId,

      amount,

      paymentMethod,

      accountNumber,

      accountName,

      status: "pending",
    });
    user.balance -= amount;
    user.pending += amount;

    await user.save();
    return NextResponse.json({
      success: true,
      message: "Withdrawal request submitted.",
      withdrawal,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
