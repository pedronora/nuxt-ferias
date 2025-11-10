<template>
  <!-- LOGIN -->
  <div
    v-if="!isAuthenticated"
    class="d-flex justify-content-center align-items-center vh-100 bg-light"
    style="min-height: 70vh"
  >
    <div class="card shadow-sm p-4" style="width: 100%; max-width: 400px">
      <h3 class="text-center mb-4">Acesso Restrito</h3>

      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="username" class="form-label">Usuário</label>
          <input
            v-model="username"
            type="text"
            id="username"
            class="form-control"
            placeholder="Digite seu usuário"
            autocomplete="username"
            required
          />
        </div>

        <div class="mb-3 position-relative">
          <label for="password" class="form-label">Senha</label>
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            id="password"
            class="form-control pe-5"
            placeholder="Digite sua senha"
            autocomplete="current-password"
            required
          />

          <!-- Botão para mostrar/ocultar senha -->
          <button
            type="button"
            class="position-absolute top-50 end-0 me-3 border-0 bg-transparent p-0"
            style="cursor: pointer"
            @click="showPassword = !showPassword"
            :title="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
          >
            <i
              :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
              style="font-size: 1.3rem; color: #6c757d"
            ></i>
          </button>
        </div>

        <button type="submit" class="btn btn-primary w-100" :disabled="loading">
          <span v-if="!loading">Entrar</span>
          <span v-else>
            <span class="spinner-border spinner-border-sm me-2"></span
            >Entrando...
          </span>
        </button>

        <div v-if="loginError" class="alert alert-danger mt-3" role="alert">
          {{ loginError }}
        </div>
      </form>
    </div>
  </div>

  <!-- CONTEÚDO PRINCIPAL -->
  <div v-else class="container">
    <h1 class="my-4">Consulta de Férias - 2026</h1>

    <div v-if="pending" class="alert alert-info" role="alert">
      Carregando dados de férias...
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      Falha ao carregar os dados de férias: {{ error.message }}
    </div>

    <div v-else>
      <div class="d-flex justify-content-between">
        <button @click="exportarParaCSV" class="btn btn-success mb-3">
          Exportar CSV
        </button>
        <NuxtLink class="btn btn-secondary mb-3" to="/">Voltar</NuxtLink>
      </div>

      <div class="table-responsive">
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
                  <li v-for="(p, index) in periodos(f)" :key="index">
                    {{ p }}
                  </li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAsyncData, useFetch, useSeoMeta } from "nuxt/app";
import type { Ferias } from "@prisma/client";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

useSeoMeta({
  title: "Férias Marcadas | Gerenciamento de Férias  | 1º RI de Cascavel/PR",
  description:
    "1º RI de Cascavel/PR - Sistema para gerenciar e visualizar pedidos de férias.",
});

const router = useRouter();

// Estado de autenticação
const isAuthenticated = ref(false);
const username = ref("");
const password = ref("");
const showPassword = ref(false);
const loading = ref(false);
const loginError = ref("");

// --- LOGIN HANDLER ---
async function handleLogin() {
  loading.value = true;
  loginError.value = "";

  try {
    const response = await $fetch<{ token: string }>("/api/auth/login", {
      method: "POST",
      body: { username: username.value, password: password.value },
    });

    sessionStorage.setItem("auth_token", response.token);
    isAuthenticated.value = true;
  } catch (err: any) {
    loginError.value = "Usuário ou senha inválidos.";
  } finally {
    loading.value = false;
  }
}

// Verifica token no carregamento
onMounted(() => {
  const token = sessionStorage.getItem("auth_token");
  if (token) isAuthenticated.value = true;
});

// --------------------
// DADOS DE FÉRIAS
// --------------------
type FeriasWithPeriods = Ferias & {
  periodo1I: string | Date | null;
  periodo1F: string | Date | null;
  periodo2I: string | Date | null;
  periodo2F: string | Date | null;
  periodo3I: string | Date | null;
  periodo3F: string | Date | null;
};

const {
  data: ferias,
  pending,
  error,
} = await useAsyncData<FeriasWithPeriods[]>("ferias-data", () =>
  $fetch("/api/ferias")
);

function calcularDias(inicio: Date, fim: Date): number {
  const diffTime = Math.abs(fim.getTime() - inicio.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

function formatarData(data: Date): string {
  const dia = String(data.getUTCDate()).padStart(2, "0");
  const mes = String(data.getUTCMonth() + 1).padStart(2, "0");
  const ano = data.getUTCFullYear();
  return `${dia}/${mes}/${ano}`;
}

function periodos(feria: FeriasWithPeriods): string[] {
  const allPeriods: string[] = [];
  const keys = [
    { inicio: "periodo1I", fim: "periodo1F" },
    { inicio: "periodo2I", fim: "periodo2F" },
    { inicio: "periodo3I", fim: "periodo3F" },
  ] as const;

  for (const k of keys) {
    const ini = feria[k.inicio];
    const fim = feria[k.fim];
    if (ini && fim) {
      const i = new Date(ini);
      const f = new Date(fim);
      if (!isNaN(i.getTime()) && !isNaN(f.getTime())) {
        allPeriods.push(
          `${formatarData(i)} - ${formatarData(f)} (${calcularDias(i, f)} dias)`
        );
      }
    }
  }

  return allPeriods.length > 0 ? allPeriods : ["Nenhum período registrado"];
}

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
      alert(`Falha ao gerar o CSV: ${error.value.message}`);
      return;
    }

    if (csvData.value) {
      const blob = new Blob([csvData.value as string], {
        type: "text/csv;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = "exportacao.csv";
      link.click();
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    alert("Ocorreu um erro inesperado ao exportar o CSV.");
  }
}
</script>
