import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";

const REFERRAL_REWARD = 0;

export async function POST(request: NextRequest) {
  try {
    // ----------------------------------------
    // 1. Authenticate through unified auth
    // ----------------------------------------

    const authUser = await getAuthenticatedUser();

    if (!authUser.authenticated || !authUser.email) {
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

    const email = authUser.email;

    // ----------------------------------------
    // 2. Read request
    // ----------------------------------------

    const { referralId } = await request.json();

    if (!referralId || typeof referralId !== "string") {
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

    const cleanReferralId = referralId.trim();

    if (!cleanReferralId) {
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

    // ----------------------------------------
    // 3. Connect MongoDB
    // ----------------------------------------

    await connectDB();

    // ----------------------------------------
    // 4. Find current MongoDB user by email
    // ----------------------------------------

    const currentUser = await User.findOne({
      email,
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

    // ----------------------------------------
    // 5. Check if referral already claimed
    // ----------------------------------------

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

    // ----------------------------------------
    // 6. Find referrer
    // ----------------------------------------

    const referrer = await User.findOne({
      referralId: cleanReferralId,
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

    // ----------------------------------------
    // 7. Prevent self referral
    // ----------------------------------------

    if (
      referrer._id.toString() ===
      currentUser._id.toString()
    ) {
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

    // ----------------------------------------
    // 8. Mark current user as referred
    // ----------------------------------------

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

    // ----------------------------------------
    // 9. Reward referrer
    // ----------------------------------------

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

    // ----------------------------------------
    // 10. Response
    // ----------------------------------------

    return NextResponse.json({
      success: true,
      message: "Referral claimed successfully.",
      reward: REFERRAL_REWARD,
    });
  } catch (error) {
    console.error("[Referral API] Error:", error);

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
