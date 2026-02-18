import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UserRegisterDto {
  @IsNotEmpty()
  @IsString()
  userAccount = '';

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  userPassword = '';

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  checkPassword = '';
}
