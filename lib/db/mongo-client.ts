import dns from "dns";
import { MongoClient } from "mongodb";
import { mongoClientOptions } from "@/lib/db/connectionOptions";

dns.setDefaultResultOrder("ipv4first");

declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongoClientUri: string | undefined;
}

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }
  return uri;
}

// Lazily connects so Next.js build can import this module without MONGODB_URI.
function getClientPromise(): Promise<MongoClient> {
  const uri = getMongoUri();

  if (
    process.env.NODE_ENV === "development" &&
    global._mongoClientUri &&
    global._mongoClientUri !== uri
  ) {
    global._mongoClientPromise = undefined;
    void global._mongoClient?.close().catch(() => undefined);
    global._mongoClient = undefined;
    global._mongoClientUri = undefined;
  }

  if (global._mongoClientPromise && global._mongoClientUri === uri) {
    return global._mongoClientPromise;
  }

  const client = new MongoClient(uri, mongoClientOptions);
  const promise = client.connect().then((connected) => {
    global._mongoClient = connected;
    return connected;
  });

  global._mongoClientPromise = promise.catch((error) => {
    global._mongoClientPromise = undefined;
    global._mongoClient = undefined;
    global._mongoClientUri = undefined;
    throw error;
  });
  global._mongoClientUri = uri;

  return global._mongoClientPromise;
}

const clientPromise: Promise<MongoClient> = {
  then(onFulfilled, onRejected) {
    return getClientPromise().then(onFulfilled, onRejected);
  },
  catch(onRejected) {
    return getClientPromise().catch(onRejected);
  },
  finally(onFinally) {
    return getClientPromise().finally(onFinally);
  },
  [Symbol.toStringTag]: "Promise",
} as Promise<MongoClient>;

export default clientPromise;
