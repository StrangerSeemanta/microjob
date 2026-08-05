import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";


import WithdrawalRequest from "@/models/WithdrawalRequest";
import { connectDB } from "@/lib/mongodb";

export async function GET() {
  try {
    await connectDB();

    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const withdrawals = await WithdrawalRequest.find({
      clerkId,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    return NextResponse.json({
      success: true,
      withdrawals,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}