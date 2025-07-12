import { Test, TestingModule } from '@nestjs/testing';
import { PurchasingManagerService } from './purchasing_manager.service';

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
});
