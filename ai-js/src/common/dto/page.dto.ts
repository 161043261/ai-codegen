import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class PageRequestDto {
  @ApiPropertyOptional({ description: "当前页号", default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNum?: number = 1;

  @ApiPropertyOptional({ description: "页面大小", default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @ApiPropertyOptional({ description: "排序字段" })
  @IsOptional()
  @IsString()
  sortField?: string;

  @ApiPropertyOptional({ description: "排序顺序", default: "descend" })
  @IsOptional()
  @IsString()
  sortOrder?: string = "descend";
}

export class DeleteRequestDto {
  @ApiProperty({ description: "ID" })
  @Type(() => String)
  id: string;
}
