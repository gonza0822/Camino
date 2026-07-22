import dns from "dns";
import fs from "fs";
import mongoose from "mongoose";

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
if (!uri) {
  console.error("Missing MONGODB_URI in .env.local");
  process.exit(1);
}

const testUri =
  process.argv.includes("--direct") && uri.startsWith("mongodb://")
    ? uri.replace(
        /mongodb:\/\/[^@]+@([^,]+).*/,
        (_, host) =>
          `mongodb://${uri.match(/mongodb:\/\/([^@]+)@/)?.[1]}@${host}/?ssl=true&directConnection=true&authSource=admin&appName=Camino`,
      )
    : uri;

console.log("Scheme:", testUri.split("://")[0]);
console.log("Hosts:", testUri.includes("@") ? testUri.split("@")[1]?.split("/")[0] : "?");

try {
  const conn = await mongoose.connect(testUri, {
    serverSelectionTimeoutMS: 15000,
    family: 4,
  });
  console.log("OK — host:", conn.connection.host, "db:", conn.connection.name);

  const probe = await conn.connection.db
    .collection("_connectivity_probe")
    .insertOne({ at: new Date() });
  await conn.connection.db
    .collection("_connectivity_probe")
    .deleteOne({ _id: probe.insertedId });
  console.log("OK — write/delete on primary");

  await mongoose.disconnect();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("FAIL —", message);
  process.exit(1);
}
