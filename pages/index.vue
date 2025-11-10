<template>
  <div class="container mt-5">
    <h1 class="mb-4">Marcação de Férias - 2026</h1>

    <div v-if="alertMessage" :class="`alert ${alertType}`" role="alert">
      {{ alertMessage }}
    </div>

    <form @submit.prevent="enviar">
      <div class="row">
        <div class="col-md-6">
          <div class="mb-3">
            <label for="nome" class="form-label">Nome</label>
            <input
              v-model="nome"
              type="text"
              class="form-control"
              id="nome"
              required
            />
          </div>
        </div>

        <div class="col-md-6">
          <div class="mb-3">
            <label for="email" class="form-label">E-mail</label>
            <input
              v-model="email"
              type="email"
              class="form-control"
              id="email"
              required
            />
          </div>
        </div>
      </div>

      <div class="mb-4 p-3 border rounded bg-light">
        <h5 class="mb-2">Resumo da Seleção</h5>
        <p class="mb-1" :class="totalDiasClass">
          Total de dias selecionados:
          <strong>{{ totalDiasSelecionados }}</strong>
          (Exatamente 30 dias são requeridos)
        </p>
        <small class="text-muted">
          A contagem inclui o dia de início e o dia de fim.
        </small>
      </div>

      <div
        v-for="(periodo, index) in periodos"
        :key="index"
        class="mb-4 p-3 border rounded"
      >
        <label class="form-label">Período {{ index + 1 }}</label>

        <div class="d-flex gap-2 align-items-center">
          <input
            v-model="periodo.inicio"
            type="date"
            class="form-control"
            placeholder="Início"
            @change="validatePeriodo(index)"
          />
          <input
            v-model="periodo.fim"
            type="date"
            class="form-control"
            placeholder="Fim"
            @change="validatePeriodo(index)"
          />

          <button
            v-if="periodos.length > 1"
            @click.prevent="removerPeriodo(index)"
            class="btn btn-danger btn-sm"
            type="button"
            title="Remover Período"
          >
            &times;
          </button>
        </div>
        <small v-if="periodoErrors[index]" class="text-danger mt-1 d-block">
          {{ periodoErrors[index] }}
        </small>
      </div>

      <div class="d-flex justify-content-start gap-2 mb-3">
        <button
          v-if="periodos.length < MAX_PERIODOS"
          @click.prevent="adicionarPeriodo"
          class="btn btn-secondary"
          type="button"
        >
          + Adicionar Período ({{ periodos.length }} de {{ MAX_PERIODOS }})
        </button>

        <button
          type="submit"
          class="btn btn-primary"
          :class="{ 'opacity-50': isSubmitDisabled }"
          :disabled="isSubmitDisabled"
        >
          <span v-if="!loading">Enviar Marcação</span>
          <span v-else>
            <span class="spinner-border spinner-border-sm me-2"></span
            >Enviando...
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import * as yup from "yup";
import { useFetch, useSeoMeta } from "nuxt/app";

useSeoMeta({
  title: "Minhas Férias | Gerenciamento de Férias | 1º RI de Cascavel/PR",
  description:
    "1º RI de Cascavel/PR - Sistema para gerenciar e visualizar pedidos de férias.",
});

interface Periodo {
  inicio: string;
  fim: string;
}

const nome = ref("");
const email = ref("");
const periodos = ref<Periodo[]>([{ inicio: "", fim: "" }]);
const periodoErrors = ref<string[]>([""]);

const alertMessage = ref("");
const alertType = ref("alert-success");

const loading = ref(false);

const MAX_PERIODOS = 3;
const MIN_DIAS_PERIODO = 5;

// --- Lógica de Manipulação de Períodos ---

function adicionarPeriodo() {
  if (periodos.value.length < MAX_PERIODOS) {
    periodos.value.push({ inicio: "", fim: "" });
    periodoErrors.value.push("");
  }
}

function removerPeriodo(index: number) {
  if (periodos.value.length > 1) {
    periodos.value.splice(index, 1);
    periodoErrors.value.splice(index, 1);
  }
}

// --- Funções de Validação e Cálculo ---

/**
 * Calcula a diferença de dias entre duas datas (strings do v-model),
 * incluindo o dia de início e fim (+1).
 */
function calcularDiferencaDias(inicio: string, fim: string): number {
  if (!inicio || !fim) return 0;

  // Crucial adicionar T00:00:00 para garantir que o JS trate a string
  // como data UTC no início do dia e evite problemas de fuso horário.
  const dataInicio = new Date(inicio + "T00:00:00");
  const dataFim = new Date(fim + "T00:00:00");

  if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
    return 0;
  }

  const diffTime = dataFim.getTime() - dataInicio.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  return diffDays > 0 ? diffDays : 0;
}

/**
 * Propriedade computada para calcular o total de dias de férias.
 */
const totalDiasSelecionados = computed(() => {
  return periodos.value.reduce((total, p) => {
    return total + calcularDiferencaDias(p.inicio, p.fim);
  }, 0);
});

/**
 * Classe de cor para o sumário de dias.
 */
const totalDiasClass = computed(() => {
  const total = totalDiasSelecionados.value;
  if (total === 30) return "text-success";
  if (total > 0 && total < 30) return "text-warning";
  if (total > 30) return "text-danger";
  return "text-muted";
});

/**
 * Validação de UX em tempo real para um único período.
 */
function validatePeriodo(index: number) {
  const periodo = periodos.value[index];
  periodoErrors.value[index] = "";

  if (!periodo.inicio || !periodo.fim) return;

  const inicio = new Date(periodo.inicio);
  const fim = new Date(periodo.fim);

  if (inicio.getTime() > fim.getTime()) {
    periodoErrors.value[index] =
      "A data de início deve ser anterior ou igual à data de fim.";
    return;
  }

  const dias = calcularDiferencaDias(periodo.inicio, periodo.fim);

  if (dias < MIN_DIAS_PERIODO && dias > 0) {
    periodoErrors.value[
      index
    ] = `Este período deve ter no mínimo ${MIN_DIAS_PERIODO} dias.`;
  }

  // A validação de data fora de 2026 é tratada apenas no Submit do Yup,
  // mas você poderia replicar essa lógica aqui para feedback imediato no campo.
}

/**
 * Propriedade para desabilitar o botão de envio.
 */
const isSubmitDisabled = computed(() => {
  const hasPeriodErrors = periodoErrors.value.some((err) => err.length > 0);
  const hasIncompletePeriod = periodos.value.some((p) => !p.inicio || !p.fim);
  const totalDias = totalDiasSelecionados.value;

  return (
    !nome.value.trim() ||
    !email.value.trim() ||
    hasPeriodErrors ||
    hasIncompletePeriod ||
    totalDias !== 30
  );
});

// --- Validação Yup Completa no Envio ---

// Função auxiliar para o Yup, que recebe objetos Date e calcula os dias.
function calcularDiasForYup(inicio: Date, fim: Date): number {
  // Garante que a comparação é feita apenas por data, ignorando a hora (fuso horário)
  const dataInicio = new Date(inicio.toISOString().split("T")[0] + "T00:00:00");
  const dataFim = new Date(fim.toISOString().split("T")[0] + "T00:00:00");

  const diffTime = dataFim.getTime() - dataInicio.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays > 0 ? diffDays : 0;
}

// 📌 DEFINIÇÃO DOS LIMITES DE DATA
const INICIO_2026 = new Date("2026-01-01T00:00:00");
const FIM_2026 = new Date("2026-12-31T00:00:00");

const schema = yup.object().shape({
  nome: yup.string().required("Nome é obrigatório"),
  email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),

  periodos: yup
    .array()
    .of(
      yup.object({
        inicio: yup
          .date()
          .required("Data de início é obrigatória.")
          // 🛑 VALIDAÇÃO DE DATA: Não pode ser antes de 01/01/2026
          .min(
            INICIO_2026,
            "A data de início deve ser em 2026 ou posterior (a partir de 01/01/2026)."
          ),

        fim: yup
          .date()
          .required("Data de fim é obrigatória.")
          // 🛑 VALIDAÇÃO DE DATA: Não pode ser depois de 31/12/2026
          .max(
            FIM_2026,
            "A data de fim deve ser em 2026 ou anterior (até 31/12/2026)."
          )

          // 1. Validar: Fim >= Início
          .min(
            yup.ref("inicio"),
            "A data de fim deve ser igual ou posterior à data de início."
          )

          // 2. Validar: Mínimo de 5 dias por período
          .test(
            "min5dias",
            `Cada período deve ter no mínimo ${MIN_DIAS_PERIODO} dias.`,
            function (value) {
              const inicio = (this.parent as any).inicio;
              if (!inicio || !value) return true;

              return calcularDiasForYup(inicio, value) >= MIN_DIAS_PERIODO;
            }
          ),
      })
    )
    .min(1, "É obrigatório selecionar pelo menos um período de férias.")
    // 3. Validar: Total EXATO de 30 dias no array completo
    .test(
      "total30dias",
      "O total de dias de férias deve ser exatamente 30 dias.",
      function (periodos) {
        if (!periodos || periodos.length === 0) return false;

        const total = periodos.reduce((acc, p) => {
          // Os campos 'inicio' e 'fim' aqui são objetos Date válidos
          return acc + calcularDiasForYup(p.inicio as Date, p.fim as Date);
        }, 0);

        return total === 30;
      }
    ),
});

// --- Lógica de Envio ---

async function enviar() {
  loading.value = true;
  alertMessage.value = "";

  // 1. FILTRAR: Remove períodos onde 'inicio' ou 'fim' estão vazios.
  const periodosValidos = periodos.value.filter((p) => p.inicio && p.fim);

  const dadosParaEnvio = {
    nome: nome.value,
    email: email.value,
    // O Yup só validará períodos completos e válidos.
    periodos: periodosValidos,
  };

  try {
    // 2. VALIDAÇÃO: Executa o schema completo
    await schema.validate(dadosParaEnvio, { abortEarly: false });

    // 3. ENVIO (Simulação)
    // ⚠️ Importante: Você precisará de um endpoint '/api/ferias' real
    // em seu servidor (Nuxt, Express, etc.) para que isso funcione.
    await useFetch("/api/ferias", {
      method: "POST",
      body: dadosParaEnvio,
    });

    // 4. SUCESSO E LIMPEZA
    alertMessage.value = "Férias cadastradas com sucesso!";
    alertType.value = "alert-success";
    nome.value = "";
    email.value = "";
    periodos.value = [{ inicio: "", fim: "" }]; // Reseta
    periodoErrors.value = [""];
  } catch (err: any) {
    // 5. TRATAMENTO DE ERRO
    const serverError = err.data?.statusMessage || err.message;
    const yupErrors = err.errors ? err.errors.join(", ") : "";

    alertMessage.value =
      yupErrors || serverError || "Erro desconhecido ao enviar marcação.";
    alertType.value = "alert-danger";
  } finally {
    loading.value = false;
  }
}
</script>
