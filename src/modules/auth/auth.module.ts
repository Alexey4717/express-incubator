import { Container } from 'inversify';

import { SendConfirmationEmailEventHandler } from './application/events/handlers/send-confirmation-email.event-handler';
import { SendPasswordRecoveryEmailEventHandler } from './application/events/handlers/send-password-recovery-email.event-handler';
import { EmailNotificationService } from './application/services/email-notification.service';
import { ChangePasswordUseCase } from './application/usecases/change-password.usecase';
import { CheckCredentialsUseCase } from './application/usecases/check-credentials.usecase';
import { ConfirmEmailUseCase } from './application/usecases/confirm-email.usecase';
import { LoginUserUseCase } from './application/usecases/login-user.usecase';
import { LogoutUserUseCase } from './application/usecases/logout-user.usecase';
import { RecoveryPasswordUseCase } from './application/usecases/recovery-password.usecase';
import { RefreshTokenUseCase } from './application/usecases/refresh-token.usecase';
import { RegisterUserUseCase } from './application/usecases/register-user.usecase';
import { ResendConfirmationUseCase } from './application/usecases/resend-confirmation.usecase';
import { AuthControllers } from './controllers/auth-controllers';

export const bindAuthModule = (container: Container): void => {
  container.bind(EmailNotificationService).toSelf();
  container.bind(RegisterUserUseCase).toSelf();
  container.bind(ConfirmEmailUseCase).toSelf();
  container.bind(ResendConfirmationUseCase).toSelf();
  container.bind(RecoveryPasswordUseCase).toSelf();
  container.bind(ChangePasswordUseCase).toSelf();
  container.bind(CheckCredentialsUseCase).toSelf();
  container.bind(LoginUserUseCase).toSelf();
  container.bind(LogoutUserUseCase).toSelf();
  container.bind(RefreshTokenUseCase).toSelf();
  container.bind(SendConfirmationEmailEventHandler).toSelf();
  container.bind(SendPasswordRecoveryEmailEventHandler).toSelf();
  container.bind(AuthControllers).toSelf();
};
