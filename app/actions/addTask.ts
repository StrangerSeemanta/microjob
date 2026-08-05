"use server";

import { getCollection } from "@/lib/db";

export async function addTaskToDatabase(formData: FormData) {
  const title = formData.get("title")?.toString().trim();
  const link = formData.get("link")?.toString().trim();
  const description =
    formData.get("description")?.toString().trim() ||
    "Complete this task to earn rewards.";
  if (!title || !description) {
    throw new Error("Missing required fields");
  }

  const DATA = {
    title,
    link,
    description,
  };

  const collection = await getCollection("taskDB", "tasks");

  await collection.insertOne(DATA);
  return {
    success: true,
    message: "Task added successfully",
  };
}
