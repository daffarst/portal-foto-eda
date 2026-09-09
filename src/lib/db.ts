import { PrismaClient } from "@prisma/client";

// Next.js dev server hot-reloads modules; tanpa ini setiap reload bikin
// koneksi Prisma baru dan cepat kena limit koneksi.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
