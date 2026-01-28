import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from "typeorm";
import { snowflake } from "../../../common/utils/snowflake";

@Entity("app")
export class App {
  @PrimaryColumn({ type: "bigint", comment: "id" })
  id: string;

  @Column({ name: "appName", length: 128, comment: "应用名称" })
  appName: string;

  @Column({
    name: "cover",
    type: "text",
    nullable: true,
    comment: "封面（首页截图）",
  })
  cover?: string;

  @Column({
    name: "initPrompt",
    type: "text",
    nullable: true,
    comment: "应用的初始化提示词",
  })
  initPrompt?: string;

  @Column({
    name: "codeGenType",
    length: 64,
    nullable: true,
    default: "html",
    comment: "代码生成类型",
  })
  codeGenType?: string;

  @Column({
    name: "deployKey",
    length: 256,
    nullable: true,
    comment: "部署的随机访问 key",
  })
  deployKey?: string;

  @Column({
    name: "deployedTime",
    type: "datetime",
    nullable: true,
    comment: "部署时间",
  })
  deployedTime?: Date;

  @Column({ name: "priority", type: "int", default: 0, comment: "优先级" })
  priority: number;

  @Column({ name: "userId", type: "bigint", comment: "创建用户 id" })
  userId: string;

  @Column({
    name: "editTime",
    type: "datetime",
    nullable: true,
    comment: "编辑时间",
  })
  editTime?: Date;

  @CreateDateColumn({ name: "createTime", comment: "创建时间" })
  createTime: Date;

  @UpdateDateColumn({ name: "updateTime", comment: "更新时间" })
  updateTime: Date;

  @Column({
    name: "isDelete",
    type: "tinyint",
    default: 0,
    comment: "是否删除",
  })
  isDelete: number;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = snowflake.nextId();
    }
  }
}
