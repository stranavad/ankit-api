import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AuthService } from './auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(PrismaService) private prismaService: PrismaService,
    @Inject(AuthService) private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let authorizationHeader = request.headers.authorization || null;

    if (!authorizationHeader) {
      return false;
    }
    authorizationHeader = authorizationHeader.split(' ')[1];

    const account = await this.authService.getAccountDetails(
      authorizationHeader,
    );

    if (!account) {
      return false;
    }

    request['accountId'] = account.id;

    // const currentDate = Date.now();
    return true;
    // return expiresAt >= currentDate;
  }
}
