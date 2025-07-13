import { Test, TestingModule } from '@nestjs/testing';
import { PurchasingManagerService } from './purchasing_manager.service';
import * as fs from 'fs'; // Importamos 'fs' para poder mocká-lo

// Mock de dados para ser usado em todos os testes
const mockPayload = {
  contratos: [
    {
      id: 1,
      data: '2025-01-15',
      parcelas: [
        { valorvencimento: 100, totalpago: 100, datavencimento: '2025-01-15', dataultimopagamento: '2025-01-15' },
        { valorvencimento: 100, totalpago: 50,  datavencimento: '2025-02-15', dataultimopagamento: '2025-02-15' },
        { valorvencimento: 100, totalpago: 0,   datavencimento: '2025-03-15', dataultimopagamento: null },
      ],
    },
    {
      id: 2,
      data: '2025-03-01',
      parcelas: [
        { valorvencimento: 200, totalpago: 0, datavencimento: '2025-03-01', dataultimopagamento: null },
      ],
    },
  ],
};

// Início da suíte de testes para o PurchasingManagerService
describe('PurchasingManagerService', () => {
  let service: PurchasingManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PurchasingManagerService],
    }).compile();

    service = module.get<PurchasingManagerService>(PurchasingManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Grupo de testes para o método calculateDebt
  describe('calculateDebt', () => {
    it('deve retornar o valor total da dívida em aberto corretamente', () => {
      const expectedDebt = 50 + 100 + 200; // 350
      const result = service.calculateDebt(mockPayload);
      expect(result.total_open).toBe(expectedDebt);
    });

    it('deve retornar 0 se não houver contratos no payload', () => {
      const result = service.calculateDebt({ contratos: [] });
      expect(result.total_open).toBe(0);
    });

    it('deve retornar 0 se todas as parcelas estiverem pagas', () => {
      const paidPayload = { contratos: [{ parcelas: [{ valorvencimento: 100, totalpago: 100 }] }] };
      const result = service.calculateDebt(paidPayload);
      expect(result.total_open).toBe(0);
    });
  });

  // Grupo de testes para o método calculatesLargestDebt
  describe('calculatesLargestDebt', () => {
    it('deve encontrar o mês com o maior valor de dívida acumulada', () => {
      const result = service.calculatesLargestDebt(mockPayload);
      expect(result.month).toBe('03/2025');
      expect(result.total_open).toBe(350);
    });
  });

  // Grupo de testes para o método findAll
  describe('findAll', () => {
    const readFileSyncSpy = jest.spyOn(fs, 'readFileSync');

    afterEach(() => {
      readFileSyncSpy.mockClear();
    });
    
    it('deve ler, parsear e ordenar os dados do arquivo', () => {
      const mockFileContent = JSON.stringify(mockPayload);
      readFileSyncSpy.mockReturnValue(mockFileContent);

      const result = service.findAll();

      expect(readFileSyncSpy).toHaveBeenCalled();
      expect(result[0].id).toBe(2); // Contrato de Março (mais recente)
      expect(result[1].id).toBe(1); // Contrato de Janeiro
    });
  });
});