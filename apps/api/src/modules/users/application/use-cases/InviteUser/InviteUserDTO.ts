export interface InviteUserInput {
  name: string;
  email: string;
  role?: 'admin' | 'agent' | 'customer';
}

export interface InviteUserOutput {
  id: string;
  name: string;
  email: string;
}
