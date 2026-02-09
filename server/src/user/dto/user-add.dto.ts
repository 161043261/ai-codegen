import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserAddDto {
  @IsNotEmpty()
  @IsString()
  userAccount: string;

  @IsNotEmpty()
  @IsString()
  userPassword: string;

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
