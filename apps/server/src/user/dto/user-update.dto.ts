import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../common/enums';

export class UserUpdateDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  id = 0;

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
  @IsEnum(UserRole)
  userRole?: UserRole;
}
