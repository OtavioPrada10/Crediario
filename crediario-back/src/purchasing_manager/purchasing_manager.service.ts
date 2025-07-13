import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PurchasingManagerService {

  findAll() {
    const filePath = path.join(process.cwd(), 'src', 'purchasing_manager', 'dados.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const registrosObj = JSON.parse(data);
    const registros = Array.isArray(registrosObj) ? registrosObj : registrosObj.contratos;
    registros.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()); console.log(registros)
    return registros;
  }

  calculatesLargestDebt(payload: any) {
    const contracts = payload.contratos;

    // Coleta todas as parcelas com datas convertidas
    const allInstallments = contracts.flatMap(contract =>
      contract.parcelas.map(p => ({
        ...p,
        vencimento: new Date(p.datavencimento),
        pagamento: p.dataultimopagamento ? new Date(p.dataultimopagamento) : null,
        valor: p.valorvencimento,
        pago: p.totalpago,
      }))
    );

    if (allInstallments.length === 0) {
      return { month: null, total_open: 0 };
    }

    // Determina os limites do tempo: da primeira parcela até o último pagamento
    const firstDate = allInstallments.reduce((min, p) => p.vencimento < min ? p.vencimento : min, allInstallments[0].vencimento);
    const lastPaymentDate = allInstallments.reduce((max, p) =>
      (p.pagamento && p.pagamento > max) ? p.pagamento : max,
      allInstallments[0].vencimento
    );

    // Cria o mapa mês a mês da dívida acumulada
    const monthlyDebtMap: Record<string, number> = {};

    let current = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
    const end = new Date(lastPaymentDate.getFullYear(), lastPaymentDate.getMonth(), 1);

    while (current <= end) {
      const monthKey = this.formatMonth(current.toISOString());

      let totalOpen = 0;

      for (const p of allInstallments) {
        const vencimento = new Date(p.vencimento.getFullYear(), p.vencimento.getMonth(), 1);

        // Só considera parcelas cujo vencimento já ocorreu
        if (vencimento <= current) {
          // Considera pagamentos que já foram feitos até esse mês
          const pagamentoEfetivo = p.pagamento && p.pagamento <= current ? p.pago : 0;
          const restante = p.valor - pagamentoEfetivo;
          totalOpen += restante > 0 ? restante : 0;
        }
      }

      monthlyDebtMap[monthKey] = totalOpen;
      current.setMonth(current.getMonth() + 1);
    }

    // Pega o mês de maior dívida
    const [month, total] = Object.entries(monthlyDebtMap).reduce((a, b) => b[1] > a[1] ? b : a);

    return {
      month,
      total_open: Math.round(total * 100) / 100,
    };
  }

  private formatMonth(dateStr: string): string {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
  }

  calculateDebt(payload: any): { total_open: number } {
    const contracts = payload.contratos;

    // Retorna 0 se não houver contratos
    if (!contracts || !Array.isArray(contracts)) {
      return { total_open: 0 };
    }

    //Junta todas as parcelas de todos os contratos em uma única lista.
    const totalOpenDebt = contracts
      .flatMap(contract => contract.parcelas)
      .reduce((accumulator, installment) => {
        // Calcula o valor restante para a parcela atual
        const remaining = (installment.valorvencimento ?? 0) - (installment.totalpago ?? 0);

        // Adiciona o valor restante ao total acumulado
        // (ignora se a parcela foi paga a mais)
        return accumulator + (remaining > 0 ? remaining : 0);
      }, 0);

    return {
      total_open: Math.round(totalOpenDebt * 100) / 100,
    };
  }
}
