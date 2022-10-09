export enum RoleType {
  VIEW = 'view',
  EDIT = 'edit',
  ADMIN = 'admin',
  OWNER = 'owner',
}

export function parseRole(role: string): RoleType {
  switch (role) {
    case RoleType.VIEW:
      return RoleType.VIEW;
    case RoleType.EDIT:
      return RoleType.EDIT;
    case RoleType.ADMIN:
      return RoleType.ADMIN;
    case RoleType.OWNER:
      return RoleType.OWNER;
    default:
      return RoleType.VIEW;
  }
}
