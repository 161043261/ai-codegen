import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { CodegenType } from '../../common/enums';

@Entity('app')
export class AppEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: 'id' })
  id = 0;

  @Index('idx_app_name')
  @Column({
    name: 'app_name',
    type: 'varchar',
    length: 256,
    nullable: true,
    comment: 'app name',
  })
  appName = '';

  @Column({
    name: 'app_cover',
    type: 'varchar',
    length: 512,
    nullable: true,
    comment: 'app cover',
  })
  appCover = '';

  @Column({
    name: 'init_prompt',
    type: 'text',
    nullable: true,
    comment: 'init prompt',
  })
  initPrompt = '';

  @Column({
    name: 'codegen_type',
    type: 'varchar',
    length: 64,
    nullable: true,
    comment: 'codegen type',
  })
  codegenType: CodegenType = CodegenType.MULTI_FILES;

  @Index('uk_deploy_key', { unique: true })
  @Column({
    name: 'deploy_key',
    type: 'varchar',
    length: 64,
    nullable: true,
    comment: 'deploy key',
  })
  deployKey = '';

  @Column({
    name: 'deploy_time',
    type: 'varchar',
    length: 64,
    nullable: true,
    comment: 'deploy time',
  })
  deployTime = '';

  @Column({ name: 'priority', type: 'int', default: 0, comment: 'priority' })
  priority = 0;

  @Index('idx_user_id')
  @Column({ name: 'user_id', type: 'bigint', comment: 'creator user id' })
  userId = 0;

  @Column({
    name: 'edit_time',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    comment: 'edit time',
  })
  editTime = new Date();

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
