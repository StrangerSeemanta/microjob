"use server";

import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

import { getAuthenticatedUser } from "@/lib/auth/getAuthenticatedUser";

// =====================================================
// Add / Update Support Link
// =====================================================

export async function addSupportLink(
  formData: FormData,
) {
  try {
    // -----------------------------------------
    // 1. Get support link
    // -----------------------------------------

    const supportLink = formData
      .get("support_link")
      ?.toString()
      .trim();

    if (!supportLink) {
      throw new Error(
        "Missing required fields = Support Link",
      );
    }

    // -----------------------------------------
    // 2. Validate URL
    // -----------------------------------------

    if (!supportLink.startsWith("https://")) {
      return {
        success: false,
        message:
          "Link needs to start with -> https://",
      };
    }

    // -----------------------------------------
    // 3. Authenticate
    //
    // Supports:
    // - Supabase users
    // - Existing Clerk users
    // -----------------------------------------

    const {
      authenticated,
    } = await getAuthenticatedUser();

    if (!authenticated) {
      return {
        success: false,
        message:
          "Unauthorized. Please sign in again.",
      };
    }

    // -----------------------------------------
    // 4. Get metadata collection
    // -----------------------------------------

    const collection = await getCollection(
      "internal",
      "metadata",
    );

    // -----------------------------------------
    // 5. Update support link
    // -----------------------------------------

    const doc =
      await collection.findOneAndUpdate(
        {
          metadata_name: "support_link",
        },
        {
          $set: {
            telegram_link: supportLink,
          },
        },
      );

    if (!doc) {
      return {
        success: false,
        message:
          "Can't update support link...View server logs",
      };
    }

    return {
      success: true,
      message:
        "Support link added successfully",
    };
  } catch (error) {
    console.error(
      "addSupportLink error:",
      error,
    );

    return {
      success: false,
      message:
        "Failed to update support link.",
    };
  }
}

// =====================================================
// Get Support Link
// =====================================================

export async function getSupportLink() {
  const collection = await getCollection(
    "internal",
    "metadata",
  );

  const doc =
    (await collection.findOne({
      metadata_name: "support_link",
    })) as unknown as {
      _id: ObjectId;
      metadata_link: string;
      telegram_link: string;
    };

  if (!doc) {
    return {
      success: false,
      message:
        "Can't get support link...View server logs",
      support_link: null,
    };
  }

  return {
    success: true,
    message:
      "Support link retrieved successfully",
    support_link: doc.telegram_link,
  };
}
