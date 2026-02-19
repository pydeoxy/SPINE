import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/client'
import { DATABASE_URL, NODE_ENV } from "../src/config";

declare global {
  var prisma: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
let prisma: PrismaClient;

if (NODE_ENV === "dev") {
  if (!global.prisma) {
    global.prisma = new PrismaClient({
      adapter,
      log: ["query", "info", "warn", "error"],
    });
  }
  prisma = global.prisma;

} else {
  prisma = new PrismaClient({
    adapter,
    log: ["error"],
  });
}

export { prisma };