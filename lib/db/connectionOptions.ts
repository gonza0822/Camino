import type { MongoClientOptions } from "mongodb";
import type { ConnectOptions } from "mongoose";

// Shared Atlas options tuned for Vercel serverless + M0 (small pool, IPv4, short select).
export const mongoClientOptions: MongoClientOptions = {
  maxPoolSize: 1,
  minPoolSize: 0,
  maxIdleTimeMS: 10_000,
  serverSelectionTimeoutMS: 8_000,
  connectTimeoutMS: 8_000,
  family: 4,
};

export const mongooseConnectOptions: ConnectOptions = {
  maxPoolSize: 1,
  minPoolSize: 0,
  maxIdleTimeMS: 10_000,
  serverSelectionTimeoutMS: 8_000,
  connectTimeoutMS: 8_000,
  family: 4,
};
