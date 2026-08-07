import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const REFERRAL_REWARD = 0;

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const { referralId } = await request.json();

    if (!referralId) {
      return NextResponse.json(
        {
          success: false,
          message: "Referral ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    //----------------------------------------
    // Current User
    //----------------------------------------

    const currentUser = await User.findOne({
      clerkId: userId,
    });

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        },
      );
    }

    //----------------------------------------
    // Already used?
    //----------------------------------------

    if (currentUser.referredBy) {
      return NextResponse.json(
        {
          success: false,
          message: "Referral has already been claimed.",
        },
        {
          status: 400,
        },
      );
    }

    //----------------------------------------
    // Find Referrer
    //----------------------------------------

    const referrer = await User.findOne({
      referralId: referralId,
    });

    if (!referrer) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Referral ID.",
        },
        {
          status: 404,
        },
      );
    }

    //----------------------------------------
    // Self referral
    //----------------------------------------

    if (referrer.clerkId === currentUser.clerkId) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot refer yourself.",
        },
        {
          status: 400,
        },
      );
    }

    //----------------------------------------
    // Reward Current User
    //----------------------------------------

    await User.updateOne(
      {
        _id: currentUser._id,
      },
      {
        $set: {
          referredBy: referrer.referralId,
        },
      },
    );

    //----------------------------------------
    // Reward Referrer
    //----------------------------------------

    await User.updateOne(
      {
        _id: referrer._id,
      },
      {
        $inc: {
          balance: REFERRAL_REWARD,

          referralCount: 1,
        },
      },
    );

    return NextResponse.json({
      success: true,

      message: "Referral claimed successfully.",

      reward: REFERRAL_REWARD,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error.",
      },
      {
        status: 500,
      },
    );
  }
}
