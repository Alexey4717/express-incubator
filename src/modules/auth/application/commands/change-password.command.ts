export class ChangePasswordCommand {
  constructor(
    public readonly recoveryCode: string,
    public readonly newPassword: string,
  ) {}
}
