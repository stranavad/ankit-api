import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(PrismaService) private prismaService: PrismaService,
    @Inject(AuthService) private authService: AuthService,
    @Inject(UserService) private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.authService.parseAuthorizationToken(
      request.headers?.authorization,
    );
    const accountId = Number(request.headers.account_id) || null;

    // TODO comparsion with NaN will always result false
    if (!token || !accountId) {
      return false;
    }

    const userAuth = await this.userService.findUserIdByAccessToken(
      accountId,
      token,
    );

    if (!userAuth || userAuth.accessToken !== token) {
      return false;
    }

    request['userId'] = userAuth.id;

    return this.authService.isExpiresAtValid(userAuth.expiresAt);
  }
}
