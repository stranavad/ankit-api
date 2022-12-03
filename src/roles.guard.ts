import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth/auth.service';
import { RoleType } from './role';
import { AccountService } from './account/account.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(AuthService) private authService: AuthService,
    @Inject(AccountService) private accountService: AccountService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<RoleType[]>('roles', context.getHandler());
    const requiredRole = roles ? roles[0] : RoleType.VIEW;

    const request = context.switchToHttp().getRequest();

    const jwtPayload = this.authService.getJwtPayload(
      request.headers.authorization,
    );

    const spaceId = Number(request.params.id) || null;

    if (!jwtPayload || !spaceId) {
      return false;
    }

    const memberAuth = await this.authService.authenticateSpaceRoute(
      jwtPayload.id,
      spaceId,
    );

    if (!memberAuth) {
      return false;
    }

    request['userId'] = jwtPayload.id;
    request['memberId'] = memberAuth.id;
    request['role'] = memberAuth.role;
    request['spaceId'] = spaceId;

    return this.authService.isRoleEnough(requiredRole, memberAuth.role);
  }
}
