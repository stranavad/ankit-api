import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './auth/auth.service';
import { RoleType } from './role';
import { AccountService } from './account/account.service';

@Injectable()
export class QuestionnaireGuard implements CanActivate {
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

    this.authService.checkJwt(request.headers.authorization);

    // const decodedToken = this.jwtService.decode(token || '', {});
    // const decodedToken = await this.jwtService.verify(
    //   token || '',
    //   'gaURUd9jRLXf1jDo709nDJwQZy1SsJbhspvRlb50LPFMyw7JCd',
    // );

    // console.log(decodedToken);

    const userId = Number(request.headers.userid) || null;
    const questionnaireId = Number(request.params.id) || null;

    if (!token || !userId || !questionnaireId) {
      return false;
    }

    const memberAuth =
      await this.accountService.getMemberDetailsByAccessTokenQuestionnaire(
        userId,
        token,
        questionnaireId,
      );

    if (
      !memberAuth ||
      !this.authService.isExpiresAtValid(memberAuth.expiresAt)
    ) {
      throw new HttpException(
        {
          status: 405,
          error: `Questionnaire doesn't exist or you don't have access to it`,
        },
        405,
      );
    }

    request['userId'] = memberAuth.userId;
    request['memberId'] = memberAuth.memberId;
    request['role'] = memberAuth.role;
    request['spaceId'] = memberAuth.spaceId;
    request['questionnaireId'] = memberAuth.questionnaireId;

    return this.authService.isRoleEnough(roles[0], memberAuth.role);
  }
}
