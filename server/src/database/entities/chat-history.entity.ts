import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('chat_history')
@Index('idx_app_id_create_time', ['appId', 'createTime'])
export class ChatHistoryEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: 'id' })
  id: number;

  @Column({ name: 'message', type: 'text', comment: 'message' })
  message: string;

  @Column({
    name: 'message_type',
    type: 'varchar',
    length: 32,
    comment: 'user or ai',
  })
  messageType: string;

  @Index('idx_app_id')
  @Column({ name: 'app_id', type: 'bigint', comment: 'app id' })
  appId: number;

  @Column({ name: 'user_id', type: 'bigint', comment: 'creator user id' })
  userId: number;

  @Index('idx_create_time')
  @CreateDateColumn({ name: 'create_time', comment: 'create time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: 'update time' })
  updateTime: Date;

  @Column({
    name: 'is_delete',
    type: 'tinyint',
    default: 0,
    comment: 'is delete',
  })
  isDelete: number;
}
