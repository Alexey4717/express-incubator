import { ChangePasswordCommand } from './commands/change-password.command';
import { CheckCredentialsCommand } from './commands/check-credentials.command';
import { ConfirmEmailCommand } from './commands/confirm-email.command';
import { LoginUserCommand } from './commands/login-user.command';
import { LogoutUserCommand } from './commands/logout-user.command';
import { RecoveryPasswordCommand } from './commands/recovery-password.command';
import { RefreshTokenCommand } from './commands/refresh-token.command';
import { RegisterUserCommand } from './commands/register-user.command';
import { ResendConfirmationCommand } from './commands/resend-confirmation.command';
import { SendConfirmationEmailEventHandler } from './events/handlers/send-confirmation-email.event-handler';
import { SendPasswordRecoveryEmailEventHandler } from './events/handlers/send-password-recovery-email.event-handler';
import { PasswordRecoveryRequestedEvent } from './events/password-recovery-requested.event';
import { RegistrationConfirmationEmailEvent } from './events/registration-confirmation-email.event';
import { ChangePasswordUseCase } from './usecases/change-password.usecase';
import { CheckCredentialsUseCase } from './usecases/check-credentials.usecase';
import { ConfirmEmailUseCase } from './usecases/confirm-email.usecase';
import { LoginUserUseCase } from './usecases/login-user.usecase';
import { LogoutUserUseCase } from './usecases/logout-user.usecase';
import { RecoveryPasswordUseCase } from './usecases/recovery-password.usecase';
import { RefreshTokenUseCase } from './usecases/refresh-token.usecase';
import { RegisterUserUseCase } from './usecases/register-user.usecase';
import { ResendConfirmationUseCase } from './usecases/resend-confirmation.usecase';

export const authCommandRegistrations = [
  { command: RegisterUserCommand, handler: RegisterUserUseCase },
  { command: ConfirmEmailCommand, handler: ConfirmEmailUseCase },
  { command: ResendConfirmationCommand, handler: ResendConfirmationUseCase },
  { command: RecoveryPasswordCommand, handler: RecoveryPasswordUseCase },
  { command: ChangePasswordCommand, handler: ChangePasswordUseCase },
  { command: CheckCredentialsCommand, handler: CheckCredentialsUseCase },
  { command: LoginUserCommand, handler: LoginUserUseCase },
  { command: LogoutUserCommand, handler: LogoutUserUseCase },
  { command: RefreshTokenCommand, handler: RefreshTokenUseCase },
] as const;

export const authEventRegistrations = [
  {
    event: RegistrationConfirmationEmailEvent,
    handler: SendConfirmationEmailEventHandler,
  },
  {
    event: PasswordRecoveryRequestedEvent,
    handler: SendPasswordRecoveryEmailEventHandler,
  },
] as const;
