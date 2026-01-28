import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { User } from "../entities/user.entity";

export class UserVO {
  @ApiProperty({ description: "用户ID" })
  id: string;

  @ApiPropertyOptional({ description: "用户账号" })
  userAccount?: string;

  @ApiPropertyOptional({ description: "用户昵称" })
  userName?: string;

  @ApiPropertyOptional({ description: "用户头像" })
  userAvatar?: string;

  @ApiPropertyOptional({ description: "用户简介" })
  userProfile?: string;

  @ApiProperty({ description: "用户角色" })
  userRole: string;

  @ApiProperty({ description: "创建时间" })
  createTime: Date;

  static fromEntity(user: User): UserVO {
    const vo = new UserVO();
    vo.id = user.id;
    vo.userAccount = user.userAccount;
    vo.userName = user.userName;
    vo.userAvatar = user.userAvatar;
    vo.userProfile = user.userProfile;
    vo.userRole = user.userRole;
    vo.createTime = user.createTime;
    return vo;
  }
}

export class LoginUserVO extends UserVO {
  static fromEntity(user: User): LoginUserVO {
    const vo = new LoginUserVO();
    vo.id = user.id;
    vo.userAccount = user.userAccount;
    vo.userName = user.userName;
    vo.userAvatar = user.userAvatar;
    vo.userProfile = user.userProfile;
    vo.userRole = user.userRole;
    vo.createTime = user.createTime;
    return vo;
  }
}
