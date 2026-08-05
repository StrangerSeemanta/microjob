import { ObjectId } from "mongodb";
import { getCollection } from "./db";
import { TaskType } from "@/types/TaskType";

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

export const fetchTaskById = async (task_id: string) => {
  const collection = await getCollection("taskDB", "tasks");
  const task = (await collection.findOne({
    _id: new ObjectId(task_id),
  })) as unknown as TaskType | null;

  return task;
};
