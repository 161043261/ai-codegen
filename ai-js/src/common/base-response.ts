import { ApiProperty } from "@nestjs/swagger";

export class BaseResponse<T = any> {
  @ApiProperty({ description: "响应码" })
  code: number;

  @ApiProperty({ description: "数据" })
  data: T;

  @ApiProperty({ description: "消息" })
  message: string;

  constructor(code: number, data: T, message: string) {
    this.code = code;
    this.data = data;
    this.message = message;
  }

  static success<T>(data: T): BaseResponse<T> {
    return new BaseResponse(0, data, "ok");
  }

  static error(code: number, message: string): BaseResponse<null> {
    return new BaseResponse(code, null, message);
  }
}

export class PageResponse<T> {
  @ApiProperty({ description: "数据列表" })
  records: T[];

  @ApiProperty({ description: "总行数" })
  totalRow: number;

  @ApiProperty({ description: "当前页码" })
  pageNumber: number;

  @ApiProperty({ description: "每页大小" })
  pageSize: number;

  constructor(
    records: T[],
    totalRow: number,
    pageNumber: number,
    pageSize: number,
  ) {
    this.records = records;
    this.totalRow = totalRow;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
  }
}
