import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserRegisterDto {
  @IsNotEmpty()
  @IsString()
  userAccount: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  userPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  checkPassword: string;
}
