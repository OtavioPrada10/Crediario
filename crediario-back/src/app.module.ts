import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PurchasingManagerModule } from './purchasing_manager/purchasing_manager.module'
import { PurchasingManagerController } from './purchasing_manager/purchasing_manager.controller'
import {  PurchasingManagerService } from './purchasing_manager/purchasing_manager.service'

@Module({
  imports: [PurchasingManagerModule],
  controllers: [AppController, PurchasingManagerController],
  providers: [AppService, PurchasingManagerService],
})
export class AppModule { }
