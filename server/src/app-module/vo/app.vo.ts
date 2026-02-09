import { AppEntity } from '../../database/entities/app.entity';

export class AppVo {
  id: string;
  appName: string;
  appCover: string;
  initPrompt: string;
  codegenType: string;
  deployKey: string;
  deployTime: string;
  priority: number;
  userId: string;
  createTime: Date;
  updateTime: Date;

  static fromEntity(entity: AppEntity): AppVo | null {
    if (!entity) return null;
    const vo = new AppVo();
    vo.id = String(entity.id);
    vo.appName = entity.appName;
    vo.appCover = entity.appCover;
    vo.initPrompt = entity.initPrompt;
    vo.codegenType = entity.codegenType;
    vo.deployKey = entity.deployKey;
    vo.deployTime = entity.deployTime;
    vo.priority = entity.priority;
    vo.userId = String(entity.userId);
    vo.createTime = entity.createTime;
    vo.updateTime = entity.updateTime;
    return vo;
  }
}
