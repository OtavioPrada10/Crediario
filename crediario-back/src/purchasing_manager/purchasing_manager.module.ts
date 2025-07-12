import { Module } from '@nestjs/common';
import { PurchasingManagerController } from './purchasing_manager.controller';
import { PurchasingManagerService } from './purchasing_manager.service';

@Module({
  controllers: [PurchasingManagerController],
  providers: [PurchasingManagerService]
})
export class PurchasingManagerModule {}
