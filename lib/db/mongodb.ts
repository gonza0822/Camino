import dns from "dns";
import mongoose from "mongoose";
import { mongooseConnectOptions } from "@/lib/db/connectionOptions";

dns.setDefaultResultOrder("ipv4first");

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: typeof mongoose | undefined;
  // eslint-disable-next-line no-var
  var _mongooseUri: string | undefined;
}

// Cache Mongoose connection for serverless reuse; reconnect when URI changes in dev.
export async function connectMongo(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  const cached = global._mongooseConn;
  if (cached && global._mongooseUri === uri && cached.connection.readyState === 1) {
    return cached;
  }

  if (cached) {
    await cached.disconnect();
    global._mongooseConn = undefined;
    global._mongooseUri = undefined;
  }

  try {
    const conn = await mongoose.connect(uri, mongooseConnectOptions);
    global._mongooseConn = conn;
    global._mongooseUri = uri;
    return conn;
  } catch (error) {
    global._mongooseConn = undefined;
    global._mongooseUri = undefined;
    throw error;
  }
}
