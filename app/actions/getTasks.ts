import { getCollection } from "@/lib/db";

export async function getTasksFromDatabase() {
  try {
    const collection = await getCollection("taskDB", "tasks");
    const tasks = await collection.find({}).toArray();
    return tasks;
  } catch (error) {
    throw new Error("Error Happened When Getting Tasks: " + error);
  }
}
