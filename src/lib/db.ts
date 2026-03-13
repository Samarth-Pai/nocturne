import mongoose from "mongoose";
import dns from "dns";

// Fix for ISP DNS blocking MongoDB SRV lookups
dns.setServers(["8.8.8.8", "8.8.4.4"]);

declare global {
  var __mongooseConnPromise: Promise<typeof mongoose> | undefined;
}

function forceDatabaseName(uri: string, dbName: string): string {
  try {
    const parsed = new URL(uri);
    parsed.pathname = `/${dbName}`;
    return parsed.toString();
  } catch {
    return uri;
  }
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  const dbName = "nocturne";
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set");
  }

  const normalizedMongoUri = forceDatabaseName(mongoUri, dbName);

  if (!global.__mongooseConnPromise) {
    global.__mongooseConnPromise = mongoose.connect(normalizedMongoUri, {
      dbName,
      autoIndex: true,
      bufferCommands: false,
    });
  }

  try {
    return await global.__mongooseConnPromise;
  } catch (error) {
    // Reset cached promise so the next request can retry after a failed connect.
    global.__mongooseConnPromise = undefined;
    throw error;
  }
}
