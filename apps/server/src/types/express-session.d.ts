import { LoginUserVo } from '../user/vo/user.vo';

declare module 'express-session' {
  interface SessionData {
    login?: LoginUserVo;
  }
}
