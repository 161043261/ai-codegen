import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from "typeorm";
import { snowflake } from "../../../common/utils/snowflake";

@Entity("user")
export class User {
  @PrimaryColumn({ type: "bigint", comment: "id" })
  id: string;

  @Column({ name: "userAccount", length: 256, comment: "账号" })
  userAccount: string;

  @Column({ name: "userPassword", length: 512, comment: "密码" })
  userPassword: string;

  @Column({
    name: "userName",
    length: 256,
    nullable: true,
    comment: "用户昵称",
  })
  userName?: string;

  @Column({
    name: "userAvatar",
    length: 1024,
    nullable: true,
    comment: "用户头像",
  })
  userAvatar?: string;

  @Column({
    name: "userProfile",
    length: 512,
    nullable: true,
    comment: "用户简介",
  })
  userProfile?: string;

  @Column({
    name: "userRole",
    length: 256,
    default: "user",
    comment: "用户角色：user/admin/ban",
  })
  userRole: string;

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
