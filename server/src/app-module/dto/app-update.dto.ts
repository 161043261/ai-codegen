import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AppUpdateDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  appName?: string;
}
