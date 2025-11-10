import { PrismaClient } from "@prisma/client";

function formatNome(nome: string): string {
  if (!nome) return nome;
  return nome
    .toLowerCase()
    .split(" ")
    .map((palavra, i) => {
      const preposicoes = ["de", "da", "do", "das", "dos"];
      if (preposicoes.includes(palavra) && i > 0) return palavra;
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(" ");
}

const prisma = new PrismaClient();

const prismaExtended = prisma.$extends({
  query: {
    $allModels: {
      async create({ model, args, query }) {
        const data = args.data as any;

        if ("nome" in data && typeof data.nome === "string") {
          data.nome = formatNome(data.nome);
        }
        if ("email" in data && typeof data.email === "string") {
          data.email = data.email.toLowerCase();
        }

        return query({ ...args, data } as any);
      },
      async update({ model, args, query }) {
        const data = args.data as any;

        if ("nome" in data) {
          if (typeof data.nome === "string") data.nome = formatNome(data.nome);
          if (data.nome?.set) data.nome.set = formatNome(data.nome.set);
        }
        if ("email" in data) {
          if (typeof data.email === "string")
            data.email = data.email.toLowerCase();
          if (data.email?.set) data.email.set = data.email.set.toLowerCase();
        }

        return query({ ...args, data } as any);
      },
    },
  },
});

export default prismaExtended;
