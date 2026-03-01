import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PageRequestDto } from '../../common/dto/page-request-dto';

export class ChatHistoryQueryDto extends PageRequestDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  appId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsString()
  messageType?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
