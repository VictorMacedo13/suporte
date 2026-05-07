export type AuthRole = 'admin' | 'agent' | 'customer';

export interface AuthSessionUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
}
