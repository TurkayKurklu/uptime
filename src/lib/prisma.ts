import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@auth/prisma-adapter"; // Wait, PrismaNeon is from @prisma/adapter-neon
import { PrismaNeon as PrismaNeonAdapter } from "@prisma/adapter-neon";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Configure Neon for environments that don't support WebSockets natively (like Node.js)
neonConfig.webSocketConstructor = ws;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl = process.env.DATABASE_URL!;

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaNeonAdapter(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
