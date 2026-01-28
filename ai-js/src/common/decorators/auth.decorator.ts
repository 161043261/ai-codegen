import {
  SetMetadata,
  createParamDecorator,
  ExecutionContext,
  applyDecorators,
  UseGuards,
} from "@nestjs/common";
import { UserRole } from "../enums/user-role.enum";
import { AuthGuard } from "../guards/auth.guard";

export const ROLES_KEY = "roles";
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const Public = () => SetMetadata("isPublic", true);

export const RequireLogin = () => applyDecorators(UseGuards(AuthGuard));

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.session?.user || request.user;
    return data ? user?.[data] : user;
  },
);
