import { RoleType } from '../role';

export const enum UpdateQuestionnairePermission {
  NAME = 'name',
  DESCRIPTION = 'description',
  STRUCTURE = 'structure',
  CATEGORY = 'category',
  STATUS = 'status',
  TIME_LIMIT = 'timeLimit',
  ALLOW_RETURN = 'allowReturn',
  PASSWORD = 'password',
}

const updateQuestionnairePermissions: {
  [key in UpdateQuestionnairePermission]: RoleType;
} = {
  name: RoleType.EDIT,
  description: RoleType.EDIT,
  structure: RoleType.EDIT,
  category: RoleType.ADMIN,
  status: RoleType.ADMIN,
  timeLimit: RoleType.EDIT,
  allowReturn: RoleType.EDIT,
  password: RoleType.ADMIN,
};
