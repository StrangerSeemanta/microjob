import { ObjectId } from "mongodb";
import { getCollection } from "./db";

export const fetchTasks = async () => {
  try {
    const collection = await getCollection("taskDB", "tasks");
    const tasks = (await collection.find({}).toArray()) as unknown as {
      _id: ObjectId | string;
      title: string;
      description: string;
    }[];
    return tasks;
  } catch (error) {
    throw new Error("Failed to fetch tasks: " + error);
  }
};
