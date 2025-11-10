import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { defineEventHandler, readBody, createError, setCookie } from "h3";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username: string; password: string }>(event);

  const user = await prisma.user.findUnique({
    where: { username: body.username },
  });

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Usuário inválido" });
  }

  const isValid = await bcrypt.compare(body.password, user.passwordHash);

  if (!isValid) {
    throw createError({ statusCode: 401, statusMessage: "Senha incorreta" });
  }

  // Gerar token simples (não JWT, apenas para esta demo)
  const token = Buffer.from(`${user.username}:${Date.now()}`).toString(
    "base64"
  );

  // Salvar em cookie (simples)
  setCookie(event, "auth_token", token, { httpOnly: false, path: "/" });

  return { message: "Login bem-sucedido", token };
});
