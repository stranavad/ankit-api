import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';
import { AccountService } from './account/account.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(PrismaService) private prismaService: PrismaService,
    @Inject(AuthService) private authService: AuthService,
    @Inject(UserService) private userService: UserService,
    @Inject(AccountService) private accountService: AccountService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.authService.parseAuthorizationToken(
      request.headers?.authorization,
    );
    const userId = Number(request.headers.userid) || null;
    if (!token || !userId) {
      return false;
    }

    const userAuth = await this.accountService.findAccountByUserId(
      userId,
      token,
    );

    if (!userAuth) {
      return false;
    }

    request['userId'] = userAuth.id;

    return this.authService.isExpiresAtValid(userAuth.expiresAt);
  }
}
