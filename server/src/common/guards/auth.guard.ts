import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { BusinessException } from '../exceptions/business.exception';
import { ErrorCode } from '../enums/error-code';
import { UserRole } from '../enums/user-role';
import { USER_LOGIN_STATE } from '../constants';

export const AUTH_KEY = 'auth_check';
export const MUST_ROLE_KEY = 'must_role';

export const AuthCheck = (mustRole?: UserRole) => {
  return (
    target: object,
    key: string,
    descriptor: TypedPropertyDescriptor<unknown>,
  ) => {
    SetMetadata(AUTH_KEY, true)(target, key, descriptor as PropertyDescriptor);
    if (mustRole) {
      SetMetadata(MUST_ROLE_KEY, mustRole)(
        target,
        key,
        descriptor as PropertyDescriptor,
      );
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

    const request = context.switchToHttp().getRequest<Request>();
    const loginUser = request.session?.[USER_LOGIN_STATE];

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
