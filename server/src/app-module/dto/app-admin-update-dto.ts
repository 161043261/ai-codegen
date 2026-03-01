import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
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
  @IsEnum(CodegenType)
  codegenType?: CodegenType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priority?: number;
}
