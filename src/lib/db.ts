import { MongoClient, Db, Collection, Document, ObjectId } from "mongodb";
import { env } from "@/lib/env";

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

const uri = env.MONGODB_URI;
const dbName = env.MONGODB_DB;

/**
 * Connect to MongoDB with connection reuse across serverless lambdas and HMR cycles.
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (clientPromise) {
    return clientPromise;
  }

  // In development and production, cache the promise across hot-reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 2000, // Fast failover in testing/preview environments
      connectTimeoutMS: 3000,
    });
    global._mongoClientPromise = client.connect();
  }

  clientPromise = global._mongoClientPromise;
  return clientPromise;
}

/**
 * Retrieve the active MongoDB database instance.
 */
export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}

/**
 * Retrieve a typed MongoDB collection.
 */
export async function getCollection<T extends Document>(
  name: "projects" | "profile" | "experience" | "messages" | "rate_limits",
): Promise<Collection<T>> {
  const db = await getDb();
  return db.collection<T>(name);
}

/**
 * Cleanly transforms a MongoDB document to a client-safe plain object:
 * Converts _id to string id and strips any raw BSON types.
 */
export function sanitizeDocument<T extends Record<string, unknown>>(
  doc: Document | null,
): T | null {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return {
    ...rest,
    id: _id instanceof ObjectId ? _id.toHexString() : String(_id),
  } as unknown as T;
}

/**
 * Cleanly transforms a list of MongoDB documents to client-safe objects.
 */
export function sanitizeDocuments<T extends Record<string, unknown>>(docs: Document[]): T[] {
  return docs.map((doc) => sanitizeDocument<T>(doc)).filter((item): item is T => item !== null);
}

/**
 * Checks if MongoDB is reachable.
 */
export async function isMongoConnected(): Promise<boolean> {
  try {
    const client = await getMongoClient();
    await client.db(dbName).command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}
