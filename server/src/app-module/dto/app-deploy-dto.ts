import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class AppDeployDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  appId = 0;
}
