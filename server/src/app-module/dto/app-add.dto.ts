import { IsNotEmpty, IsString } from 'class-validator';

export class AppAddDto {
  @IsNotEmpty()
  @IsString()
  appName: string;

  @IsNotEmpty()
  @IsString()
  initPrompt: string;
}
