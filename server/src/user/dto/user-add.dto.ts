import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
  @IsString()
  userRole?: string;
}
