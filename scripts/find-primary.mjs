import dns from "dns";
import fs from "fs";
import { MongoClient } from "mongodb";

dns.setDefaultResultOrder("ipv4first");

function loadEnvLocal() {
  const raw = fs.readFileSync(".env.local", "utf8");
  for (const line of raw.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    process.env[line.slice(0, index)] = line.slice(index + 1);
  }
}

loadEnvLocal();

const uri = process.env.MONGODB_URI;
if (!uri?.startsWith("mongodb://")) {
  console.error("Set MONGODB_URI in .env.local first");
  process.exit(1);
}

const credentials = uri.match(/^mongodb:\/\/([^@]+)@/)?.[1];
const dbName = uri.match(/\.net(?::\d+)?\/([^?]+)/)?.[1] ?? "camino";

const hosts = [
  "ac-lzw1dvt-shard-00-00.yysaaje.mongodb.net:27017",
  "ac-lzw1dvt-shard-00-01.yysaaje.mongodb.net:27017",
  "ac-lzw1dvt-shard-00-02.yysaaje.mongodb.net:27017",
];

let primaryHost = null;

for (const host of hosts) {
  const testUri = `mongodb://${credentials}@${host}/${dbName}?ssl=true&directConnection=true&authSource=admin&appName=Camino`;
  const client = new MongoClient(testUri, {
    serverSelectionTimeoutMS: 8000,
    family: 4,
  });

  try {
    await client.connect();
    const hello = await client.db("admin").command({ hello: 1 });
    const role = hello.isWritablePrimary ? "PRIMARY" : "secondary";
    console.log(`${host} → ${role}`);

    if (hello.isWritablePrimary) {
      primaryHost = host;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`${host} → unreachable (${message})`);
  } finally {
    await client.close().catch(() => undefined);
  }
}

if (!primaryHost) {
  console.error("\nNo primary found. Check Atlas Network Access and firewall.");
  process.exit(1);
}

const recommended = `mongodb://${credentials}@${primaryHost}/${dbName}?ssl=true&directConnection=true&authSource=admin&appName=Camino`;
console.log("\nUse this MONGODB_URI in .env.local:\n");
console.log(recommended);
