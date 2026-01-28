import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";
import { PageRequestDto } from "../../../common/dto/page.dto";

export class ChatHistoryAddDto {
  @ApiProperty({ description: "消息内容" })
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: "消息类型" })
  @IsNotEmpty()
  messageType: string;

  @ApiProperty({ description: "应用ID" })
  @IsNotEmpty()
  appId: string;
}

export class ChatHistoryQueryDto extends PageRequestDto {
  @ApiPropertyOptional({ description: "应用ID" })
  @IsOptional()
  appId?: string;

  @ApiPropertyOptional({ description: "用户ID" })
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: "消息类型" })
  @IsOptional()
  messageType?: string;
}
