import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { PageRequestDto } from "../../../common/dto/page.dto";

export class UserRegisterDto {
  @ApiProperty({ description: "用户账号" })
  @IsNotEmpty({ message: "账号不能为空" })
  @IsString()
  userAccount: string;

  @ApiProperty({ description: "用户密码" })
  @IsNotEmpty({ message: "密码不能为空" })
  @MinLength(8, { message: "密码不能少于8位" })
  userPassword: string;

  @ApiProperty({ description: "确认密码" })
  @IsNotEmpty({ message: "确认密码不能为空" })
  checkPassword: string;
}

export class UserLoginDto {
  @ApiProperty({ description: "用户账号" })
  @IsNotEmpty({ message: "账号不能为空" })
  @IsString()
  userAccount: string;

  @ApiProperty({ description: "用户密码" })
  @IsNotEmpty({ message: "密码不能为空" })
  userPassword: string;
}

export class UserAddDto {
  @ApiProperty({ description: "用户账号" })
  @IsNotEmpty({ message: "账号不能为空" })
  userAccount: string;

  @ApiProperty({ description: "用户密码" })
  @IsNotEmpty({ message: "密码不能为空" })
  userPassword: string;

  @ApiPropertyOptional({ description: "用户昵称" })
  @IsOptional()
  userName?: string;

  @ApiPropertyOptional({ description: "用户头像" })
  @IsOptional()
  userAvatar?: string;

  @ApiPropertyOptional({ description: "用户角色" })
  @IsOptional()
  userRole?: string;
}

export class UserUpdateDto {
  @ApiProperty({ description: "用户ID" })
  @IsNotEmpty()
  id: string;

  @ApiPropertyOptional({ description: "用户昵称" })
  @IsOptional()
  userName?: string;

  @ApiPropertyOptional({ description: "用户头像" })
  @IsOptional()
  userAvatar?: string;

  @ApiPropertyOptional({ description: "用户简介" })
  @IsOptional()
  userProfile?: string;

  @ApiPropertyOptional({ description: "用户角色" })
  @IsOptional()
  userRole?: string;
}

export class UserQueryDto extends PageRequestDto {
  @ApiPropertyOptional({ description: "用户ID" })
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: "用户账号" })
  @IsOptional()
  userAccount?: string;

  @ApiPropertyOptional({ description: "用户昵称" })
  @IsOptional()
  userName?: string;

  @ApiPropertyOptional({ description: "用户角色" })
  @IsOptional()
  userRole?: string;
}
