import { defineEventHandler } from "h3";
import prisma from "~/server/lib/prisma";

export default defineEventHandler(async () => {
  return prisma.ferias.findMany({
    orderBy: { createdAt: "desc" },
  });
});
