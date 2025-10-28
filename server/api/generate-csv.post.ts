import {
  defineEventHandler,
  readBody,
  createError,
  setResponseHeader,
} from "h3";
import { parse } from "json2csv";

export default defineEventHandler(async (event) => {
  // 1. Lê o corpo da requisição (que deve ser o seu JSON)
  const jsonData = await readBody(event);

  if (!jsonData) {
    throw createError({
      statusCode: 400,
      statusMessage: "Nenhum dado JSON fornecido",
    });
  }

  try {
    // 2. Usa a biblioteca 'json2csv' AQUI (no servidor)
    const csv = parse(jsonData);

    // 3. Define o cabeçalho para indicar que é um arquivo CSV
    setResponseHeader(event, "Content-Type", "text/csv");
    setResponseHeader(
      event,
      "Content-Disposition",
      'attachment; filename="export.csv"'
    );

    // 4. Retorna o CSV como texto puro
    return csv;
  } catch (err: any) {
    throw createError({
      statusCode: 500,
      statusMessage: `Erro ao gerar CSV: ${err.message}`,
    });
  }
});
