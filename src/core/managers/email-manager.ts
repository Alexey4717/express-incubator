import { add } from 'date-fns';
import { injectable } from 'inversify';
import { v4 as uuidv4 } from 'uuid';

import { EmailService } from '../../modules/auth/services/email-service';
import { GetUserOutputModelFromMongoDB } from '../../modules/users/models/UserModels/GetUserOutputModel';
import { UsersRepository } from '../../modules/users/repositories/CUD/users-repository';
import type { SendEmailConfirmationMessageInputType } from './types';

@injectable()
export class EmailManager {
  constructor(
    protected usersRepository: UsersRepository,
    protected emailService: EmailService,
  ) {}

  async sendPasswordRecoveryMessage(email: string): Promise<boolean> {
    const foundUser = await this.usersRepository.findByLoginOrEmail(email);
    // Even if current email is not registered (for prevent user's email detection)
    if (!foundUser) return true;

    const recoveryData = {
      recoveryCode: uuidv4(),
      expirationDate: add(new Date(), { days: 1 }),
    };

    const result = await this.usersRepository.setUserRecoveryData({
      userId: foundUser._id,
      recoveryData,
    });
    // Even if current email is not registered (for prevent user's email detection)
    if (!result) return true;

    return await this.emailService.sendEmailConfirmationMessage({
      email,
      subject: 'Password recovery',
      message: `
                <h1>Password recovery</h1>
                <p>To finish password recovery please follow the link below:
                    <a href='${process.env.MAIN_URL}/password-recovery?recoveryCode=${recoveryData.recoveryCode}'>
                        recovery password
                    </a>
                </p>
            `,
    });
  }

  async sendEmailConfirmationMessage({
    user,
    confirmationCode,
  }: SendEmailConfirmationMessageInputType): Promise<boolean> {
    if (confirmationCode) {
      const result = await this.usersRepository.updateUserConfirmationCode({
        userId: user._id,
        newCode: confirmationCode,
      });
      if (!result) return false;
    }

    return await this.emailService.sendPasswordRecoveryMessage({
      email: user.accountData.email,
      subject: 'Registration confirmation',
      message: `
                <p>To confirm registration please follow the link below:
                    <a href='${process.env.MAIN_URL}/confirm-registration?code=${confirmationCode || user.emailConfirmation.confirmationCode}'>
                        confirm registration
                    </a>
                </p>
            `,
    });
  }
}
