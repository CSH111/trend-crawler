import { PrismaClient } from "@prisma/client";

const pr = new PrismaClient({ log: ["error"] });

export { pr };
