<template>
  <div class="container">
    <h2>Meus Contratos de Crediário</h2>
    <table class="contratos-table text">
      <thead>
        <tr>
          <th>&nbsp;</th> <th>Contrato</th>
          <th>Data</th>
          <th>Valor Financiado</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="contrato in contratos" :key="contrato.contrato">
          <tr class="contrato-row">
            <td>
              <button @click="toggleDetalhes(contrato.contrato)" class="expand-button">
                {{ contratoAberto === contrato.contrato ? '−' : '+' }}
              </button>
            </td>
            <td>{{ contrato.contrato }}</td>
            <td>{{ formatarData(contrato.data) }}</td>
            <td>{{ formatarMoeda(contrato.valorfinanciado) }}</td>
            <td>
              <span :class="['status', calcularStatus(contrato).class]">
                {{ calcularStatus(contrato).texto }}
              </span>
            </td>
          </tr>

          <tr v-if="contratoAberto === contrato.contrato" class="detalhes-row">
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
                      <td>{{ formatarData(parcela.datavencimento) }}</td>
                      <td>{{ formatarMoeda(parcela.valorvencimento) }}</td>
                      <td>{{ formatarData(parcela.dataultimopagamento) }}</td>
                      <td>
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
import { ref, onMounted } from 'vue';
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
const contratoAberto = ref<string | null>(null);

//Função para expandir/recolher os detalhes
const toggleDetalhes = (contratoId: string) => {
  if (contratoAberto.value === contratoId) {
    contratoAberto.value = null; // Se já estiver aberto, fecha
  } else {
    contratoAberto.value = contratoId;
  }
};

//Funções auxiliares para formatar os dados para exibição
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

const formatarData = (dataStr: string) => {
  if (!dataStr) return 'N/A';
  const data = new Date(dataStr);
  return new Intl.DateTimeFormat('pt-BR', {timeZone: 'UTC'}).format(data);
};

const calcularStatus = (contrato: Contrato) => {
  const totalPago = contrato.parcelas.reduce((acc, p) => acc + p.totalpago, 0);
  const temCapitalAberto = contrato.parcelas.some(p => p.capitalaberto > 0);

  if (!temCapitalAberto && totalPago >= contrato.valorfinanciado) {
    return { texto: 'Quitado', class: 'status-quitado' };
  }
  return { texto: 'Em Aberto', class: 'status-aberto' };
};

onMounted(async () => {
  try {
    const response = await axios.get('http://localhost:3000/purchasing-manager');
    contratos.value = response.data; 
    console.log(contratos.value)
  } catch (error) {
    console.error('Erro ao buscar contratos:', error);
  }
});
</script>

<style scoped>
.container {
  font-family: 'Open Sans';
  padding: 1rem;
}

.contratos-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.contratos-table th, .contratos-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.contratos-table th {
  background-color: #F1F6F5;
  color: #004A3F;
}

.contrato-row:hover {
  background-color: #f9f9f9;
}

.expand-button {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #ccc;
  background-color: #fff;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  line-height: 1;
}

.detalhes-row > td {
  padding: 0;
  background-color: #fafafa;
}

.parcelas-container {
  padding: 1rem 2rem;
}

.parcelas-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
}

.parcelas-table th, .parcelas-table td {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
}

.parcelas-table th {
  background-color: #e9e9e9;
}

.status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  color: #004A3F;
}

.status-quitado {
  background-color: #D7F4F0; /* Verde */
}

.status-aberto {
  background-color: #dc3545; /* Vermelho */
}
</style>