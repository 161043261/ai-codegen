import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { App } from "../entities/app.entity";
import { UserVO } from "../../user/vo/user.vo";

export class AppVO {
  @ApiProperty({ description: "应用ID" })
  id: string;

  @ApiProperty({ description: "应用名称" })
  appName: string;

  @ApiPropertyOptional({ description: "封面" })
  cover?: string;

  @ApiPropertyOptional({ description: "初始提示词" })
  initPrompt?: string;

  @ApiPropertyOptional({ description: "代码生成类型" })
  codeGenType?: string;

  @ApiPropertyOptional({ description: "部署Key" })
  deployKey?: string;

  @ApiPropertyOptional({ description: "部署时间" })
  deployedTime?: Date;

  @ApiProperty({ description: "优先级" })
  priority: number;

  @ApiProperty({ description: "用户ID" })
  userId: string;

  @ApiPropertyOptional({ description: "用户信息" })
  user?: UserVO;

  @ApiPropertyOptional({ description: "编辑时间" })
  editTime?: Date;

  @ApiProperty({ description: "创建时间" })
  createTime: Date;

  @ApiProperty({ description: "更新时间" })
  updateTime: Date;

  static fromEntity(app: App, user?: UserVO): AppVO {
    const vo = new AppVO();
    vo.id = app.id;
    vo.appName = app.appName;
    vo.cover = app.cover;
    vo.initPrompt = app.initPrompt;
    vo.codeGenType = app.codeGenType;
    vo.deployKey = app.deployKey;
    vo.deployedTime = app.deployedTime;
    vo.priority = app.priority;
    vo.userId = app.userId;
    vo.user = user;
    vo.editTime = app.editTime;
    vo.createTime = app.createTime;
    vo.updateTime = app.updateTime;
    return vo;
  }
}
