<template>
  <div class="container">
    <h2>Contratos</h2>

    <div class="filter-container">
      <div class="filter-row">
        <label>
          Data Inicial:
          <input class="dateField" type="date" v-model="filterStartDate" />
        </label>
        <label>
          Data final:
          <input class="dateField" type="date" v-model="filterEndDate" />
        </label>
      </div>
      <button class="btn" @click="calculateHighestDebt">
        Calcular maior divida
      </button>
      <div v-if="debtResult" style="margin-top: 1rem;">
        <strong>Mês com maior dívida:</strong> {{ debtResult.month }} <br />
        <strong>Valor total aberto:</strong> {{ formatarMoeda(debtResult.total_open) }}
      </div>
    </div>

    <table class="contratos-table text">
      <thead>
        <tr>
          <th>&nbsp;</th>
          <th>Contrato</th>
          <th>Data do financiamento</th>
          <th>Valor Financiado</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="contrato in filteredContracts" :key="contrato.contrato">
          <tr class="contrato-row">
            <td>
              <button @click="toggleDetalhes(contrato.contrato)" class="expand-button">
                <img v-if="contractOpen === contrato.contrato" src="../assets/icons-minus.svg" alt="Fechar" width="16"
                  height="16" />
                <img v-else src="../assets/icons-plus.svg" alt="Abrir" width="16" height="16" />
              </button>
            </td>
            <td data-label="Contrato">{{ contrato.contrato }}</td>
            <td data-label="Data do financiamento">{{ formatDate(contrato.data) }}</td>
            <td data-label="Valor Financiado">{{ formatarMoeda(contrato.valorfinanciado) }}</td>
          </tr>

          <tr v-if="contractOpen === contrato.contrato" class="detalhes-row">
            <td colspan="5">
              <div class="parcelas-container">
                <h4>Detalhes das Parcelas</h4>
                <table class="parcelas-table">
                  <thead>
                    <tr>
                      <th>Vencimento</th>
                      <th>Valor</th>
                      <th>Data Pagamento</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(parcela, idx) in contrato.parcelas" :key="idx">
                      <td data-label="Vencimento">{{ formatDate(parcela.datavencimento) }}</td>
                      <td data-label="Valor">{{ formatarMoeda(parcela.valorvencimento) }}</td>
                      <td data-label="Data Pagamento">{{ formatDate(parcela.dataultimopagamento) }}</td>
                      <td data-label="Status">
                        <span :class="['status', parcela.capitalaberto === 0 ? 'status-quitado' : 'status-aberto']">
                          {{ parcela.capitalaberto === 0 ? 'Quitada' : 'Em Aberto' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';



//Definir interfaces para tipar os dados corretamente
interface Parcela {
  valorvencimento: number;
  datavencimento: string;
  dataultimopagamento: string;
  totalpago: number;
  capitalaberto: number;
}

interface Contrato {
  parcelas: Parcela[];
  contrato: string;
  data: string;
  valortotal: number;
  valorentrada: number;
  valorfinanciado: number;
}

//O ref agora é um array de Contrato e uma variável para controlar a expansão
const contratos = ref<Contrato[]>([]);
const contractOpen = ref<string | null>(null);
const filterStartDate = ref<string | null>(null);
const filterEndDate = ref<string | null>(null);
const debtResult = ref<{ month: string; total_open: number } | null>(null);

const filteredContracts = computed(() => {
  // Se não tem nenhum filtro, retorna tudo
  if (!filterStartDate.value && !filterEndDate.value) {
    return contratos.value;
  }

  const start = filterStartDate.value ? new Date(filterStartDate.value) : null;
  const end = filterEndDate.value ? new Date(filterEndDate.value) : null;

  return contratos.value
    .filter(contrato => {
      const contratoDate = new Date(contrato.data);

      // Só start
      if (start && !end) {
        return contratoDate >= start;
      }
      // Só end
      if (!start && end) {
        return contratoDate <= end;
      }
      // Ambos
      if (start && end) {
        return contratoDate >= start && contratoDate <= end;
      }
      // Nenhum filtro
      return true;
    });
});

const calculateHighestDebt = async () => {
  if (filteredContracts.value.length === 0) {
    alert('Nenhum contrato para analisar com o filtro atual.');
    return;
  }

  try {
    const response = await axios.post('http://localhost:3000/purchasing-manager/highest-monthly-debt', {
      contratos: filteredContracts.value,
    });
    debtResult.value = response.data;
  } catch (error) {
    console.error('Erro ao calcular a dívida mais alta');
  }
};


const toggleDetalhes = (contratoId: string) => {
  if (contractOpen.value === contratoId) {
    contractOpen.value = null; // Se já estiver aberto, fecha
  } else {
    contractOpen.value = contratoId;
  }
};

//Funções auxiliares para formatar os dados para exibição
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

const formatDate = (dataStr: string) => {
  if (!dataStr) return 'N/A';
  const data = new Date(dataStr);
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(data);
};

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/purchasing-manager');
    contratos.value = response.data;
    console.log(contratos.value)
  } catch (error) {
    console.error('Erro ao buscar contratos');
  }
});
</script>