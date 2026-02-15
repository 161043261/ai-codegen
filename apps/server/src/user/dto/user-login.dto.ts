import { IsNotEmpty, IsString } from 'class-validator';

export class UserLoginDto {
  @IsNotEmpty()
  @IsString()
  userAccount = '';

  @IsNotEmpty()
  @IsString()
  userPassword = '';
}
