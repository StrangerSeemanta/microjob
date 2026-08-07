"use server";

import { getCollection } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";

export async function addSupportLink(formData: FormData) {
  const supportLink = formData.get("support_link")?.toString().trim();
  if (!supportLink) {
    throw new Error("Missing required fields = Support Link");
  }
  if (!supportLink.startsWith("https://")) {
    return {
      success: false,
      message: "Link needs to start with -> https://",
    };
  }
  const cl_user = await currentUser();
  if (!cl_user) {
    return {
      success: false,
      message: "Failed to add support_link cause: can't find clerk user",
    };
  }
  const collection = await getCollection("internal", "metadata");

  // const refined_supportLink = supportLink.startsWith("https://")?supportLink:`https://${supportLink}`

  const doc = await collection.findOneAndUpdate(
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
      message: "Can't update support link...View server logs",
    };
  }
  return {
    success: true,
    message: "support link added successfully",
  };
}
export async function getSupportLink() {
  const collection = await getCollection("internal", "metadata");
  const doc = (await collection.findOne({
    metadata_name: "support_link",
  })) as unknown as {
    _id: ObjectId;
    metadata_link: string;
    telegram_link: string;
  };
  if (!doc) {
    return {
      success: false,
      message: "Can't update support link...View server logs",
      support_link: null,
    };
  }
  return {
    success: true,
    message: "support link added successfully",
    support_link: doc.telegram_link,
  };
}
