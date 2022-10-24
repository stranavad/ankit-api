import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
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

    const userId = Number(request.headers.userid) || null;
    const spaceId = Number(request.params.id) || null;

    // TODO check for NaN
    if (!token || !userId || !spaceId) {
      return false;
    }

    const memberAuth = await this.accountService.getMemberDetailsByAccessToken(
      userId,
      token,
      spaceId,
    );

    if (
      !memberAuth ||
      !this.authService.isExpiresAtValid(memberAuth.expiresAt)
    ) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: `Doesn't belong to space`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    request['userId'] = memberAuth.userId;
    request['memberId'] = memberAuth.memberId;
    request['role'] = memberAuth.role;
    request['spaceId'] = memberAuth.spaceId;

    return this.authService.isRoleEnough(roles[0], memberAuth.role);
  }
}
