import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from "typeorm";
import { snowflake } from "../../../common/utils/snowflake";

export enum MessageType {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

@Entity("chat_history")
export class ChatHistory {
  @PrimaryColumn({ type: "bigint", comment: "id" })
  id: string;

  @Column({ name: "message", type: "text", comment: "消息内容" })
  message: string;

  @Column({
    name: "messageType",
    length: 64,
    default: "user",
    comment: "消息类型：user/assistant/system",
  })
  messageType: string;

  @Column({ name: "appId", type: "bigint", comment: "应用 id" })
  appId: string;

  @Column({ name: "userId", type: "bigint", comment: "创建用户 id" })
  userId: string;

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
