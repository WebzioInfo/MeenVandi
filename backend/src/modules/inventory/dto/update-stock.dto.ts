import { PartialType } from '@nestjs/swagger';
import { AddStockDto } from './add-stock.dto';

export class UpdateStockDto extends PartialType(AddStockDto) {}