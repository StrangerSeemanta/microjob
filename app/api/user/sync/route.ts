import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";
import { createClient } from "@/lib/supabase/server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

import crypto from "crypto";

const adminEmails = [
  "ronihalderaadi1@gmail.com",
  "quantamant@gmail.com",
];

// =====================================================
// Referral ID
// =====================================================

function generateReferralId(): string {
  return crypto
    .randomBytes(5)
    .toString("hex")
    .toUpperCase()
    .slice(0, 8);
}

async function generateUniqueReferralId(): Promise<string> {
  let referralId = generateReferralId();

  while (await User.exists({ referralId })) {
    referralId = generateReferralId();
  }

  return referralId;
}

// =====================================================
// POST /api/user/sync
// =====================================================

export async function POST() {
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
      email,
      provider,
    } = await getAuthenticatedUser();

    if (!authenticated || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // ----------------------------------------
    // 2. Connect MongoDB
    // ----------------------------------------

    await connectDB();

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const isAdmin =
      adminEmails.includes(normalizedEmail);

    // ----------------------------------------
    // 3. Get Supabase metadata if this is
    //    a Supabase-authenticated user
    //
    // Existing Clerk users don't need this.
    // ----------------------------------------

    let supabaseUser = null;

    if (provider === "supabase") {
      const supabase = await createClient();

      const {
        data: {
          user: authenticatedSupabaseUser,
        },
      } = await supabase.auth.getUser();

      supabaseUser = authenticatedSupabaseUser;
    }

    // ----------------------------------------
    // 4. Find existing MongoDB user by email
    //
    // Case-insensitive lookup protects existing
    // Clerk records whose email casing may differ.
    // ----------------------------------------

    let mongoUser = user;

    if (!mongoUser) {
      mongoUser = await User.findOne({
        email: {
          $regex: `^${normalizedEmail.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
          )}$`,
          $options: "i",
        },
      });
    }

    let created = false;

    // =====================================================
    // 5. Existing user
    // =====================================================

    if (mongoUser) {
      const updateData: Record<string, unknown> = {
        email: normalizedEmail,
      };

      // ----------------------------------------
      // Admin status
      // ----------------------------------------

      if (isAdmin) {
        updateData.role = "admin";
        updateData["publicMetadata.role"] = "admin";
      }

      // ----------------------------------------
      // Only update profile fields when we have
      // Supabase metadata available.
      //
      // This prevents an existing Clerk user's
      // profile from being overwritten with null.
      // ----------------------------------------

      if (supabaseUser) {
        const metadata =
          supabaseUser.user_metadata || {};

        if (metadata.username) {
          updateData.username =
            metadata.username;
        }

        if (metadata.first_name) {
          updateData.firstName =
            metadata.first_name;
        }

        if (metadata.last_name) {
          updateData.lastName =
            metadata.last_name;
        }

        if (metadata.avatar_url) {
          updateData.imageUrl =
            metadata.avatar_url;
        }
      }

      await User.updateOne(
        {
          _id: mongoUser._id,
        },
        {
          $set: updateData,
        },
      );

      mongoUser = await User.findById(
        mongoUser._id,
      );
    }

    // =====================================================
    // 6. New user
    // =====================================================

    if (!mongoUser) {
      const referralId =
        await generateUniqueReferralId();

      const metadata =
        supabaseUser?.user_metadata || {};

      const fullName =
        metadata.full_name
          ?.toString()
          .trim() || "";

      const nameParts =
        fullName.length > 0
          ? fullName.split(/\s+/)
          : [];

      const firstName =
        metadata.first_name ||
        nameParts[0] ||
        undefined;

      const lastName =
        metadata.last_name ||
        (nameParts.length > 1
          ? nameParts.slice(1).join(" ")
          : undefined);

      mongoUser = await User.create({
        email: normalizedEmail,

        username:
          metadata.username ||
          undefined,

        firstName,

        lastName,

        imageUrl:
          metadata.avatar_url ||
          undefined,

        publicMetadata: {
          role: isAdmin ? "admin" : "user",
          balance: 0,
          tasksCompleted: 0,
        },

        balance: 0,
        pending: 0,
        totalEarned: 0,

        paymentPending: 0,
        paymentReceived: 0,

        tasksCompleted: 0,

        role: isAdmin ? "admin" : "user",

        referralId,

        referredBy: null,

        referralCount: 0,
      });

      created = true;
    }

    // =====================================================
    // 7. Safety check
    // =====================================================

    if (!mongoUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create or locate user",
        },
        { status: 500 },
      );
    }

    // =====================================================
    // 8. Safe frontend response
    // =====================================================

    return NextResponse.json({
      success: true,

      created,

      provider,

      user: {
        id: mongoUser._id.toString(),

        // Keep existing Clerk ID available because
        // older application components may still use it.
        //
        // It is NOT used for authentication here.
        clerkId: mongoUser.clerkId,

        email: mongoUser.email,
        phone: mongoUser.phone,

        username: mongoUser.username,
        firstName: mongoUser.firstName,
        lastName: mongoUser.lastName,
        imageUrl: mongoUser.imageUrl,

        publicMetadata:
          mongoUser.publicMetadata,

        balance: mongoUser.balance,
        pending: mongoUser.pending,
        totalEarned: mongoUser.totalEarned,

        paymentPending:
          mongoUser.paymentPending,

        paymentReceived:
          mongoUser.paymentReceived,

        tasksCompleted:
          mongoUser.tasksCompleted,

        role: mongoUser.role,

        referralId:
          mongoUser.referralId,

        referredBy:
          mongoUser.referredBy,

        referralCount:
          mongoUser.referralCount,
      },
    });
  } catch (error) {
    console.error(
      "USER SYNC ERROR:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to sync user",
      },
      { status: 500 },
    );
  }
}

