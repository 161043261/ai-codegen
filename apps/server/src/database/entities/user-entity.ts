import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { UserRole } from '../../common/enums';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', comment: 'id' })
  id = 0;

  @Index('uk_user_account', { unique: true })
  @Column({
    name: 'user_account',
    type: 'varchar',
    length: 256,
    comment: 'user account',
  })
  userAccount = '';

  @Column({
    name: 'user_password',
    type: 'varchar',
    length: 512,
    comment: 'password',
  })
  userPassword = '';

  @Index('idx_username')
  @Column({
    name: 'username',
    type: 'varchar',
    length: 256,
    nullable: true,
    comment: 'username',
  })
  username = '';

  @Column({
    name: 'user_avatar',
    type: 'varchar',
    length: 1024,
    nullable: true,
    comment: 'user avatar',
  })
  userAvatar = '';

  @Column({
    name: 'user_profile',
    type: 'varchar',
    length: 512,
    nullable: true,
    comment: 'user profile',
  })
  userProfile = '';

  @Column({
    name: 'user_role',
    type: 'varchar',
    length: 256,
    default: 'user',
    comment: 'user role',
  })
  userRole: UserRole = UserRole.USER;

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
