import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PageRequestDto } from "../../../common/dto/page.dto";

export class AppAddDto {
  @ApiPropertyOptional({ description: "应用名称" })
  @IsOptional()
  @IsString()
  appName?: string;

  @ApiPropertyOptional({ description: "初始提示词" })
  @IsOptional()
  initPrompt?: string;

  @ApiPropertyOptional({ description: "代码生成类型" })
  @IsOptional()
  codeGenType?: string;
}

export class AppUpdateDto {
  @ApiProperty({ description: "应用ID" })
  @IsNotEmpty()
  id: string;

  @ApiPropertyOptional({ description: "应用名称" })
  @IsOptional()
  appName?: string;

  @ApiPropertyOptional({ description: "封面" })
  @IsOptional()
  cover?: string;

  @ApiPropertyOptional({ description: "初始提示词" })
  @IsOptional()
  initPrompt?: string;

  @ApiPropertyOptional({ description: "代码生成类型" })
  @IsOptional()
  codeGenType?: string;

  @ApiPropertyOptional({ description: "优先级" })
  @IsOptional()
  priority?: number;
}

export class AppQueryDto extends PageRequestDto {
  @ApiPropertyOptional({ description: "应用ID" })
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({ description: "应用名称" })
  @IsOptional()
  appName?: string;

  @ApiPropertyOptional({ description: "用户ID" })
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: "代码生成类型" })
  @IsOptional()
  codeGenType?: string;
}

export class ChatGenCodeDto {
  @ApiProperty({ description: "应用ID" })
  @IsNotEmpty()
  appId: string;

  @ApiProperty({ description: "消息内容" })
  @IsNotEmpty()
  message: string;
}

export class AppDeployDto {
  @ApiProperty({ description: "应用ID" })
  @IsNotEmpty()
  id: string;
}
