import { CreateUserInputModel } from '../../users/models/UserModels/CreateUserInputModel';

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
