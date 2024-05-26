import { PrismaClient } from "@prisma/client";

const pr = new PrismaClient({ log: ["query", "error"] });

export { pr };
