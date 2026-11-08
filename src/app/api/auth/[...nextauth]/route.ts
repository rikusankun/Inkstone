import { handlers } from "@/auth";

export const { GET, POST } = handlers;

export const runtime = "nodejs"; // PrismaClient 不能跑在 edge runtime
