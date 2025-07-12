import { Test, TestingModule } from '@nestjs/testing';
import { PurchasingManagerController } from './purchasing_manager.controller';

describe('PurchasingManagerController', () => {
  let controller: PurchasingManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchasingManagerController],
    }).compile();

    controller = module.get<PurchasingManagerController>(PurchasingManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
