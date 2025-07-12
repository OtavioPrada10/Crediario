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
    registros.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());    console.log(registros)
    return registros;
  }
}
