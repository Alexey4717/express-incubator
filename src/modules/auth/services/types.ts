import type { CreateUserInputModel } from '@/modules/users';

export type SendEmailConfirmationMessageInputType = {
  email: string;
  subject: string;
  message: string;
};

export type CreateUserInputType = CreateUserInputModel & {
  isConfirmed: boolean;
};

export type ChangeUserPasswordInputType = {
  recoveryCode: string;
  newPassword: string;
};
