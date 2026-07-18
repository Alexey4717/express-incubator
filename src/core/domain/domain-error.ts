export class DomainError extends Error {
  constructor(public readonly reason: string) {
    super(reason);
    this.name = 'DomainError';
  }
}
