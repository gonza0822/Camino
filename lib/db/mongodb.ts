import dns from "dns";
import mongoose from "mongoose";
import { mongooseConnectOptions } from "@/lib/db/connectionOptions";

dns.setDefaultResultOrder("ipv4first");

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: typeof mongoose | undefined;
  // eslint-disable-next-line no-var
  var _mongoosePromise: Promise<typeof mongoose> | undefined;
  // eslint-disable-next-line no-var
  var _mongooseUri: string | undefined;
}

// Resets cached connection so the next call opens a fresh one.
async function clearMongooseCache(): Promise<void> {
  const cached = global._mongooseConn;
  global._mongooseConn = undefined;
  global._mongoosePromise = undefined;
  global._mongooseUri = undefined;

  if (cached?.connection.readyState !== 0) {
    await cached?.disconnect().catch(() => undefined);
  }
}

// True for transient Atlas / network failures worth a single reconnect.
function isTransientMongoError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  const name = error.name;

  return (
    name === "MongoServerSelectionError" ||
    name === "MongoNetworkError" ||
    name === "MongoNetworkTimeoutError" ||
    message.includes("buffering timed out") ||
    message.includes("connection timed out") ||
    message.includes("not primary") ||
    message.includes("not master") ||
    message.includes("topology was destroyed") ||
    message.includes("server selection timed out")
  );
}

// Cache Mongoose connection (and in-flight promise) for serverless reuse.
export async function connectMongo(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (
    global._mongooseConn &&
    global._mongooseUri === uri &&
    global._mongooseConn.connection.readyState === 1
  ) {
    return global._mongooseConn;
  }

  if (global._mongooseUri && global._mongooseUri !== uri) {
    await clearMongooseCache();
  }

  if (!global._mongoosePromise || global._mongooseUri !== uri) {
    global._mongooseUri = uri;
    global._mongoosePromise = mongoose
      .connect(uri, mongooseConnectOptions)
      .then((conn) => {
        global._mongooseConn = conn;
        return conn;
      })
      .catch(async (error) => {
        await clearMongooseCache();
        throw error;
      });
  }

  try {
    return await global._mongoosePromise;
  } catch (error) {
    if (!isTransientMongoError(error)) throw error;

    // One reconnect attempt after clearing a dead pooled connection.
    await clearMongooseCache();
    global._mongooseUri = uri;
    global._mongoosePromise = mongoose
      .connect(uri, mongooseConnectOptions)
      .then((conn) => {
        global._mongooseConn = conn;
        return conn;
      })
      .catch(async (retryError) => {
        await clearMongooseCache();
        throw retryError;
      });

    return global._mongoosePromise;
  }
}
