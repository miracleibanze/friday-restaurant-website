import { MongoClient, type Db } from "mongodb";

const globalForMongo = globalThis as typeof globalThis & {
  fridayMongoClient?: Promise<MongoClient>;
  fridayDbPromise?: Promise<Db>;
};
let localDbPromise: Promise<Db> | undefined;

export async function getDatabase(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured.");

  const dbPromise =
    globalForMongo.fridayDbPromise ??
    localDbPromise ??
    (async () => {
      const clientPromise =
        globalForMongo.fridayMongoClient ??
        new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 }).connect();
      if (process.env.NODE_ENV !== "production") {
        globalForMongo.fridayMongoClient = clientPromise;
      }

      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB || "friday_restaurant");
      await Promise.all([
        db.collection("users").createIndex({ email: 1 }, { unique: true }),
        db.collection("orders").createIndex({ orderNumber: 1 }, { unique: true }),
        db.collection("orders").createIndex({ customerId: 1, createdAt: -1 }),
      ]);
      return db;
    })();

  localDbPromise = dbPromise;
  if (process.env.NODE_ENV !== "production") {
    globalForMongo.fridayDbPromise = dbPromise;
  }
  try {
    return await dbPromise;
  } catch (error) {
    if (localDbPromise === dbPromise) localDbPromise = undefined;
    if (globalForMongo.fridayDbPromise === dbPromise) {
      globalForMongo.fridayDbPromise = undefined;
      globalForMongo.fridayMongoClient = undefined;
    }
    throw error;
  }
}
