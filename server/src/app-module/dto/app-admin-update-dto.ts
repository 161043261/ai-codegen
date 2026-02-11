import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CodegenType } from '../../common/enums';

export class AppAdminUpdateDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  id = 0;

  @IsOptional()
  @IsString()
  appName?: string;

  @IsOptional()
  @IsString()
  appCover?: string;

  @IsOptional()
  @IsString()
  codegenType?: CodegenType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priority?: number;
}
