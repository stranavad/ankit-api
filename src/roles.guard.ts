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

    if (!roles) {
      console.error('You have not specified role for RoleGuard');
      return false;
    }

    const request = context.switchToHttp().getRequest();

    const token = this.authService.parseAuthorizationToken(
      request.headers.authorization,
    );

    const accountId = Number(request.headers.account_id) || null;
    const spaceId = Number(request.params['id']) || null;

    // TODO check for NaN
    if (
      !token ||
      !accountId ||
      // accountId === NaN ||
      !spaceId
      // spaceId === NaN
    ) {
      return false;
    }

    const memberAuth = await this.accountService.getMemberDetailsByAccessToken(
      accountId,
      token,
      spaceId,
    );

    if (
      !memberAuth ||
      token !== memberAuth.accessToken ||
      !this.authService.isExpiresAtValid(memberAuth.expiresAt)
    ) {
      return false;
    }

    request['userId'] = memberAuth.userId;
    request['memberId'] = memberAuth.memberId;
    request['role'] = memberAuth.role;

    return this.authService.isRoleEnough(roles[0], memberAuth.role);
  }
}
