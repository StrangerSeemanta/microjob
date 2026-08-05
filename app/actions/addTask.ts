"use server";

import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

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
export async function deleteTask(taskId: string) {
  const query = { _id: new ObjectId(taskId) };
  const collection = await getCollection("taskDB", "tasks");

  const result = await collection.deleteOne(query);
  return result.deletedCount === 1;
}
