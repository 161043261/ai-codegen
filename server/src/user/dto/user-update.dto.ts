import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UserUpdateDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  userAvatar?: string;

  @IsOptional()
  @IsString()
  userProfile?: string;

  @IsOptional()
  @IsString()
  userRole?: string;
}
