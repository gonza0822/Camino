import type { MongoClientOptions } from "mongodb";

// Shared driver options for Atlas on Windows (IPv4, shorter timeout).
export const mongoClientOptions: MongoClientOptions = {
  serverSelectionTimeoutMS: 10000,
  family: 4,
};

export const mongooseConnectOptions = {
  serverSelectionTimeoutMS: 10000,
  family: 4 as const,
};
