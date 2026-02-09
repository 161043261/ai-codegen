import { IsNotEmpty, IsString } from 'class-validator';

export class UserLoginDto {
  @IsNotEmpty()
  @IsString()
  userAccount: string;

  @IsNotEmpty()
  @IsString()
  userPassword: string;
}
