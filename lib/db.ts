import clientPromise from "./setupMongoClient";

export async function getDB(dbName: string) {
  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (error) {
    throw new Error("Error Happened When Getting DB: " + error);
  }
}

export async function getCollection(dbName: string, collectionName: string) {
  try {
    const db = await getDB(dbName);
    if (!db) throw new Error("Database Not Found!!!");
    const collection = db.collection(collectionName);
    return collection;
  } catch (error) {
    throw new Error("Error Happened When Getting Collection: " + error);
  }
}
export function baseToHexId(base64string: string) {
  const decodedBytes = Buffer.from(base64string, "base64");
  const hexString = decodedBytes.toString("hex");
  return hexString;
}

