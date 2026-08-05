import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";

import User from "@/models/User";
import WithdrawalRequest from "@/models/WithdrawalRequest";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await mongoose.startSession();

  try {
    await connectDB();

    const { userId: adminId } = await auth();

    if (!adminId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const admin = await User.findOne({ clerkId: adminId });

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const { id } = await params;

    const { action, rejectionReason, transactionId } = await req.json();

    session.startTransaction();

    const withdrawal = await WithdrawalRequest.findById(id).session(session);

    if (!withdrawal) {
      await session.abortTransaction();

      return NextResponse.json(
        {
          success: false,
          message: "Withdrawal not found.",
        },
        { status: 404 },
      );
    }

    if (withdrawal.status !== "pending") {
      await session.abortTransaction();

      return NextResponse.json(
        {
          success: false,
          message: "This request has already been processed.",
        },
        { status: 400 },
      );
    }

    const user = await User.findById(withdrawal.userId).session(session);

    if (!user) {
      await session.abortTransaction();

      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 },
      );
    }

    //------------------------------------
    // PAID
    //------------------------------------

    if (action === "paid") {
      withdrawal.status = "paid";
      withdrawal.transactionId = transactionId || "";
      withdrawal.reviewedBy = adminId;
      withdrawal.reviewedAt = new Date();

      user.pending -= withdrawal.amount;
      user.totalEarned += withdrawal.amount;
    }

    //------------------------------------
    // REJECT
    //------------------------------------
    else if (action === "rejected") {
      withdrawal.status = "rejected";
      withdrawal.rejectionReason = rejectionReason || "";
      withdrawal.reviewedBy = adminId;
      withdrawal.reviewedAt = new Date();

      user.balance += withdrawal.amount;
      user.pending -= withdrawal.amount;
    } else {
      await session.abortTransaction();

      return NextResponse.json(
        {
          success: false,
          message: "Invalid action.",
        },
        { status: 400 },
      );
    }

    await withdrawal.save({ session });
    await user.save({ session });

    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      message: `Withdrawal ${withdrawal.status}.`,
    });
  } catch (error) {
    await session.abortTransaction();

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  } finally {
    session.endSession();
  }
}
