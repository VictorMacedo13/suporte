export class UserAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`Usuário com email "${email}" já existe`);
    this.name = 'UserAlreadyExistsError';
  }
}

export class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`Usuário "${id}" não encontrado`);
    this.name = 'UserNotFoundError';
  }
}
