export interface ListUsersOutput {
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'agent' | 'customer';
    createdAt: string;
  }>;
}
