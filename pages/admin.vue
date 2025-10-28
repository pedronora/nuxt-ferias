<template>
  <div class="container mt-5">
    <h1 class="mb-4">Consulta de Férias - 2026</h1>

    <div v-if="pending" class="alert alert-info" role="alert">
      Carregando dados de férias...
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      Falha ao carregar os dados de férias: {{ error.message }}
    </div>

    <div v-else>
      <button @click="exportarParaCSV" class="btn btn-success mb-3">
        Exportar CSV
      </button>

      <table class="table table-bordered table-striped">
        <thead class="table-light">
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Total (dias)</th>
            <th>Períodos</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="f in ferias" :key="f.id">
            <td>{{ f.nome }}</td>
            <td>{{ f.email }}</td>
            <td class="text-center">{{ f.totalDias }}</td>
            <td>
              <ul class="mb-0">
                <li v-for="(p, index) in periodos(f)" :key="index">{{ p }}</li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAsyncData, useFetch, useSeoMeta } from "nuxt/app";
import type { Ferias } from "@prisma/client";

useSeoMeta({
  title: "Férias Marcadas | Gerenciamento de Férias",
  description: "Sistema para gerenciar e visualizar pedidos de férias.",
});

// 1. Definição do tipo auxiliar FeriasWithPeriods
// Os campos de data vêm como string ou Date do servidor, ou null
type FeriasWithPeriods = Ferias & {
  periodo1I: string | Date | null;
  periodo1F: string | Date | null;
  periodo2I: string | Date | null;
  periodo2F: string | Date | null;
  periodo3I: string | Date | null;
  periodo3F: string | Date | null;
};

// 2. Busca de Dados
const {
  data: ferias,
  pending,
  error,
} = await useAsyncData<FeriasWithPeriods[]>("ferias-data", () =>
  $fetch("/api/ferias")
);

// --- FUNÇÕES AUXILIARES ---

// Helper para calcular a diferença de dias (+1 para incluir o dia de início)
const calcularDias = (inicio: Date, fim: Date): number => {
  const diffTime = Math.abs(fim.getTime() - inicio.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

// Helper para formatar a data para o padrão brasileiro DD/MM/AAAA
const formatarData = (data: Date): string => {
  // Usando toLocaleDateString com 'pt-BR'
  return data.toLocaleDateString("pt-BR");
};

// 3. FUNÇÃO CORRIGIDA: periodos
// Extrai e formata os períodos a partir das colunas separadas
function periodos(feria: FeriasWithPeriods): string[] {
  const allPeriods: string[] = [];

  const periodKeys = [
    { inicio: "periodo1I", fim: "periodo1F" },
    { inicio: "periodo2I", fim: "periodo2F" },
    { inicio: "periodo3I", fim: "periodo3F" },
  ] as const;

  for (const keys of periodKeys) {
    const inicioValue = feria[keys.inicio];
    const fimValue = feria[keys.fim];

    // Verifica se os valores existem
    if (inicioValue && fimValue) {
      // 🚨 CORREÇÃO: Converte a string (ou Date) em um objeto Date antes de usar .getTime()
      const inicio = new Date(inicioValue);
      const fim = new Date(fimValue);

      // Garante que as datas são válidas (em caso de string inválida)
      if (!isNaN(inicio.getTime()) && !isNaN(fim.getTime())) {
        const dias = calcularDias(inicio, fim);
        const formattedInicio = formatarData(inicio);
        const formattedFim = formatarData(fim);

        allPeriods.push(`${formattedInicio} - ${formattedFim} (${dias} dias)`);
      }
    }
  }

  return allPeriods.length > 0 ? allPeriods : ["Nenhum período registrado"];
}

// 4. Função para gerar e baixar o CSV
async function exportarParaCSV() {
  if (!ferias.value) {
    alert("Os dados de férias ainda não foram carregados.");
    return;
  }

  try {
    const { data: csvData, error } = await useFetch("/api/generate-csv", {
      method: "POST",
      body: ferias.value,
    });

    if (error.value) {
      console.error("Erro ao buscar CSV:", error.value);
      alert(`Falha ao gerar o CSV: ${error.value.message}`);
      return;
    }

    if (csvData.value) {
      const blob = new Blob([csvData.value as string], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", "exportacao.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    console.error("Erro inesperado:", err);
    alert("Ocorreu um erro inesperado ao exportar o CSV.");
  }
}
</script>
