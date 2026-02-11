import { UserRole } from '../../common/enums/user-role';
import { UserEntity } from '../../database/entities/user-entity';

export class UserVo {
  id = '';
  userAccount = '';
  username = '';
  userAvatar = '';
  userProfile = '';
  userRole = '';
  createTime = new Date();

  static fromEntity(entity: UserEntity): UserVo | null {
    if (!entity) return null;
    const vo = new UserVo();
    vo.id = String(entity.id);
    vo.userAccount = entity.userAccount;
    vo.username = entity.username;
    vo.userAvatar = entity.userAvatar;
    vo.userProfile = entity.userProfile;
    vo.userRole = entity.userRole;
    vo.createTime = entity.createTime;
    return vo;
  }
}

export class LoginUserVo {
  id = '';
  userAccount = '';
  username = '';
  userAvatar = '';
  userProfile = '';
  userRole: UserRole = UserRole.USER;

  static fromEntity(entity: UserEntity): LoginUserVo | null {
    if (!entity) return null;
    const vo = new LoginUserVo();
    vo.id = String(entity.id);
    vo.userAccount = entity.userAccount;
    vo.username = entity.username;
    vo.userAvatar = entity.userAvatar;
    vo.userProfile = entity.userProfile;
    vo.userRole = entity.userRole;
    return vo;
  }
}
