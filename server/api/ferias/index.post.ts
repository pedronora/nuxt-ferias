// server/api/ferias/ferias.post.ts
import { defineEventHandler, readBody, createError } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // event tem tipo implícito any, agora é inferido pelo TypeScript
  const body = await readBody(event);
  const {
    nome,
    email,
    periodos = [],
  } = body as {
    nome: string;
    email: string;
    periodos: { inicio?: string; fim?: string }[];
  };

  if (!nome || !email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Nome e email são obrigatórios",
    });
  }

  // calcula totalDias
  const totalDias = periodos.reduce((acc: number, p) => {
    if (p.inicio && p.fim) {
      const diff =
        (new Date(p.fim).getTime() - new Date(p.inicio).getTime()) /
          (1000 * 60 * 60 * 24) +
        1;
      return acc + diff;
    }
    return acc;
  }, 0);

  if (totalDias > 30) {
    throw createError({
      statusCode: 400,
      statusMessage: "O total de férias não pode ultrapassar 30 dias",
    });
  }

  const [p1, p2, p3] = periodos;

  return prisma.ferias.create({
    data: {
      nome,
      email,
      totalDias,
      periodo1I: p1?.inicio ? new Date(p1.inicio) : null,
      periodo1F: p1?.fim ? new Date(p1.fim) : null,
      periodo2I: p2?.inicio ? new Date(p2.inicio) : null,
      periodo2F: p2?.fim ? new Date(p2.fim) : null,
      periodo3I: p3?.inicio ? new Date(p3.inicio) : null,
      periodo3F: p3?.fim ? new Date(p3.fim) : null,
    },
  });
});
