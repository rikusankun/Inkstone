import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// 开发环境复用实例，避免 HMR 反复创建连接
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
