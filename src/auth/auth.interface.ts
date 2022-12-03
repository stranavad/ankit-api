import { RoleType } from '../role';

export interface MemberAuth {
  accessToken: string | null;
  expiresAt: number | null;
  memberId: number;
  role: RoleType;
  userId: number;
  spaceId: number;
}

export interface UserAuth {
  id: number | null;
  accessToken: string | null;
  expiresAt: number | null;
}

export interface QuestionnaireAuth extends MemberAuth {
  questionnaireId: number;
}

export interface JwtPayload {
  id: number;
  iat: number;
  exp: number;
}
