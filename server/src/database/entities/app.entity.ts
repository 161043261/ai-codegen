import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('app')
export class AppEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: 'id' })
  id: number;

  @Index('idx_app_name')
  @Column({
    name: 'app_name',
    type: 'varchar',
    length: 256,
    nullable: true,
    comment: 'app name',
  })
  appName: string;

  @Column({
    name: 'app_cover',
    type: 'varchar',
    length: 512,
    nullable: true,
    comment: 'app cover',
  })
  appCover: string;

  @Column({
    name: 'init_prompt',
    type: 'text',
    nullable: true,
    comment: 'init prompt',
  })
  initPrompt: string;

  @Column({
    name: 'codegen_type',
    type: 'varchar',
    length: 64,
    nullable: true,
    comment: 'codegen type',
  })
  codegenType: string;

  @Index('uk_deploy_key', { unique: true })
  @Column({
    name: 'deploy_key',
    type: 'varchar',
    length: 64,
    nullable: true,
    comment: 'deploy key',
  })
  deployKey: string;

  @Column({
    name: 'deploy_time',
    type: 'varchar',
    length: 64,
    nullable: true,
    comment: 'deploy time',
  })
  deployTime: string;

  @Column({ name: 'priority', type: 'int', default: 0, comment: 'priority' })
  priority: number;

  @Index('idx_user_id')
  @Column({ name: 'user_id', type: 'bigint', comment: 'creator user id' })
  userId: number;

  @Column({
    name: 'edit_time',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'edit time',
  })
  editTime: Date;

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
