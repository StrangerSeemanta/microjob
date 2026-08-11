// lib/mongodb.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development and serverless container lifecycles.
 */
type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

type MongooseGlobal = typeof globalThis & {
  mongoose?: MongooseCache;
};

const cached: MongooseCache = (globalThis as MongooseGlobal).mongoose ?? {
  conn: null,
  promise: null,
};

(globalThis as MongooseGlobal).mongoose = cached;

export async function connectDB(db_name: string = "users") {
  // 1. Safety check using the global cache
  if (cached.conn) {
    return cached.conn;
  }

  // 2. If a connection isn't established yet, create a promise
  if (!cached.promise) {
    const opts = {
      dbName: db_name,
      bufferCommands: false, // Fails fast if connection drops during continuous updates
    };

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }

  try {
    // 3. Await the connection and cache it
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset promise on error so it tries again next time
    console.error("Failed to connect database: Mongoose:", e);
    throw e;
  }

  return cached.conn;
}
