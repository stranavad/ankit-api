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
  URL = 'url',
}

export const updateQuestionnairePermissions: {
  [key in UpdateQuestionnairePermission]: RoleType;
} = {
  name: RoleType.EDIT,
  description: RoleType.EDIT,
  structure: RoleType.EDIT,
  category: RoleType.EDIT,
  status: RoleType.EDIT,
  timeLimit: RoleType.EDIT,
  allowReturn: RoleType.EDIT,
  password: RoleType.EDIT,
  url: RoleType.EDIT
};
