import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PageRequestDto } from '../../common/dto/page-request-dto';
import { UserRole } from '../../common/enums';

export class UserQueryDto extends PageRequestDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  id?: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  userProfile?: string;

  @IsOptional()
  @IsEnum(UserRole)
  userRole?: UserRole;
}
