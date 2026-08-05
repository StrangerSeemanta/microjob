import { ObjectId } from "mongodb";

export interface TaskType {
  _id: ObjectId;
  title: string;
  description: string;
  link: string;
}
