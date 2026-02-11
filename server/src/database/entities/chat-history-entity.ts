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
  id = 0;

  @Column({ name: 'message', type: 'text', comment: 'message' })
  message = '';

  @Column({
    name: 'message_type',
    type: 'varchar',
    length: 32,
    comment: 'user or ai',
  })
  messageType = '';

  @Index('idx_app_id')
  @Column({ name: 'app_id', type: 'bigint', comment: 'app id' })
  appId = 0;

  @Column({ name: 'user_id', type: 'bigint', comment: 'creator user id' })
  userId = 0;

  @Index('idx_create_time')
  @CreateDateColumn({ name: 'create_time', comment: 'create time' })
  createTime = new Date();

  @UpdateDateColumn({ name: 'update_time', comment: 'update time' })
  updateTime = new Date();

  @Column({
    name: 'is_delete',
    type: 'tinyint',
    default: 0,
    comment: 'is delete',
  })
  isDelete = 0;
}
