"use server";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";

export async function addPhoneNumber(
  formData: FormData,
) {
  try {
    // -----------------------------------------
    // 1. Get phone number
    // -----------------------------------------

    const phonenumber = formData
      .get("phone")
      ?.toString()
      .trim();

    if (!phonenumber) {
      return {
        success: false,
        message: "Phone number is required.",
      };
    }

    // -----------------------------------------
    // 2. Authenticate
    //
    // Supports:
    // - Supabase users
    // - Existing Clerk users
    // -----------------------------------------

    const {
      authenticated,
      user,
    } = await getAuthenticatedUser();

    if (!authenticated) {
      return {
        success: false,
        message:
          "Unauthorized. Please sign in again.",
      };
    }

    // -----------------------------------------
    // 3. MongoDB user must exist
    // -----------------------------------------

    if (!user) {
      return {
        success: false,
        message:
          "MongoDB user account was not found.",
      };
    }

    // -----------------------------------------
    // 4. Update phone number
    // -----------------------------------------

    await connectDB();

    await User.updateOne(
      {
        _id: user._id,
      },
      {
        $set: {
          phone: phonenumber,
        },
      },
    );

    return {
      success: true,
      message:
        "Phone number added successfully.",
    };
  } catch (error) {
    console.error(
      "addPhoneNumber error:",
      error,
    );

    return {
      success: false,
      message:
        "Failed to add phone number.",
    };
  }
}
