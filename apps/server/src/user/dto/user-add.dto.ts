import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { UserRole } from '../../common/enums';

export class UserAddDto {
  @IsNotEmpty()
  @IsString()
  userAccount = '';

  @IsNotEmpty()
  @IsString()
  userPassword = '';

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  userAvatar?: string;

  @IsOptional()
  @IsEnum(UserRole)
  userRole?: UserRole;
}
