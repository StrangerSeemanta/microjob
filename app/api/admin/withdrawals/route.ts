import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

import { connectDB } from "@/lib/mongodb";

import User from "@/models/User";
import WithdrawalRequest from "@/models/WithdrawalRequest";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    //---------------------------------
    // Authentication
    //---------------------------------

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    //---------------------------------
    // Admin Check
    //---------------------------------

    const admin = await User.findOne({ clerkId: userId });

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden",
        },
        { status: 403 },
      );
    }

    //---------------------------------
    // Query Params
    //---------------------------------

    const searchParams = req.nextUrl.searchParams;

    const page = Number(searchParams.get("page")) || 1;

    const limit = Number(searchParams.get("limit")) || 20;

    const status = searchParams.get("status");

    const search = searchParams.get("search");

    //---------------------------------
    // Build Query
    //---------------------------------

    const query: Record<string, unknown> = {};

    if (status) {
      query.status = status;
    }

    //---------------------------------
    // Search User
    //---------------------------------

    if (search) {
      const users = await User.find({
        $or: [
          {
            username: {
              $regex: search,
              $options: "i",
            },
          },
          {
            email: {
              $regex: search,
              $options: "i",
            },
          },
          {
            clerkId: {
              $regex: search,
              $options: "i",
            },
          },
        ],
      }).select("_id clerkId");

      const ids = users.map((u) => u.clerkId);

      query.clerkId = {
        $in: ids,
      };
    }

    //---------------------------------
    // Count
    //---------------------------------

    const total = await WithdrawalRequest.countDocuments(query);

    //---------------------------------
    // Fetch
    //---------------------------------

    const withdrawals = await WithdrawalRequest.find(query)
      .populate("userId", "username email firstName lastName imageUrl")
      .sort({
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    //---------------------------------
    // Response
    //---------------------------------

    return NextResponse.json({
      success: true,

      total,

      page,

      totalPages: Math.ceil(total / limit),

      withdrawals,
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
