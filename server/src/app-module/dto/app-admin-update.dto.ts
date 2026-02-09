import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AppAdminUpdateDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  appName?: string;

  @IsOptional()
  @IsString()
  appCover?: string;

  @IsOptional()
  @IsString()
  codegenType?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priority?: number;
}
