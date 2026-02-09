import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { BusinessException } from '../exceptions/business.exception';
import { ErrorCode } from '../enums/error-code.enum';
import { UserRole } from '../enums/user-role.enum';

export const AUTH_KEY = 'auth_check';
export const MUST_ROLE_KEY = 'must_role';

export const AuthCheck = (mustRole?: UserRole) => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    SetMetadata(AUTH_KEY, true)(target, key!, descriptor!);
    if (mustRole) {
      SetMetadata(MUST_ROLE_KEY, mustRole)(target, key!, descriptor!);
    }
  };
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireAuth = this.reflector.getAllAndOverride<boolean>(AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const loginUser = request.session?.login;

    if (!loginUser) {
      throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
    }

    const mustRole = this.reflector.getAllAndOverride<UserRole>(MUST_ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (mustRole && mustRole === UserRole.ADMIN) {
      if (loginUser.userRole !== UserRole.ADMIN) {
        throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
      }
    }

    return true;
  }
}
