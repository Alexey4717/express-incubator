export class RegistrationConfirmationEmailEvent {
  constructor(
    public readonly email: string,
    public readonly confirmationCode: string,
  ) {}
}
