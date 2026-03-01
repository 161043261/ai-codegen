import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteRequestDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  id = 0;
}
