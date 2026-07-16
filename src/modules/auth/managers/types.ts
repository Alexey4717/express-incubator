import type { GetUserOutputModelFromMongoDB } from '@/modules/users';

export type SendEmailConfirmationMessageInputType = {
  user: GetUserOutputModelFromMongoDB;
  confirmationCode?: string;
};
