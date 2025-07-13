import {
  Body,
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PurchasingManagerService } from './purchasing_manager.service'

@Controller('purchasing-manager')
export class PurchasingManagerController {
  constructor(private readonly purchasingManagerService: PurchasingManagerService) { }

  @HttpCode(HttpStatus.OK)
  @Get()
  findAll() {
    return this.purchasingManagerService.findAll();
  };
  
  @Post('/highest-monthly-debt')
  calculatesLargestDebt(@Body() body: any) {
    return this.purchasingManagerService.calculatesLargestDebt(body);
  };
  @Post('/calculate-debt')
  calculateDebt(@Body() body: any) {
    return this.purchasingManagerService.calculateDebt(body);
  };
}
