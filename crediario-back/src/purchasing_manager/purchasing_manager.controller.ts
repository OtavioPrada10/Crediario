import {
  Controller,
  Get,
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
  }

}
