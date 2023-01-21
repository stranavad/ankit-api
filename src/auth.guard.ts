import {
  CanActivate,
  ExecutionContext,
  HttpException,
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

    const jwtPayload = this.authService.getJwtPayload(
      request.headers.authorization,
    );

    if (!jwtPayload) {
      throw new HttpException(
        {
          status: 420,
          error: 'Not logged in',
        },
        420,
      );
    }

    request['userId'] = jwtPayload.id;

    return true;
  }
}
