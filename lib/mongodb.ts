// lib/mongodb.ts

import mongoose from "mongoose";

let isConnected = false;

export async function connectDB(db_name: string = "users") {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      dbName: db_name,
    });
  } catch (error) {
    console.error("Failed to connect database:Mongoose:", error);
  }
  isConnected = true;
}
