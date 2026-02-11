import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PageRequestDto } from '../../common/dto/page-request-dto';
import { CodegenType } from '../../common/enums';

export class AppQueryDto extends PageRequestDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  appName?: string;

  @IsOptional()
  @IsString()
  codegenType?: CodegenType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsString()
  deployKey?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsString()
  initPrompt?: string;
}
