import { IsNotEmpty, IsString } from 'class-validator';

export class AppAddDto {
  // @IsNotEmpty()
  // @IsString()
  // appName = '';

  @IsNotEmpty()
  @IsString()
  initPrompt = '';
}
