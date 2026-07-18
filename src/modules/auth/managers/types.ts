import type { TUserDb } from '@/modules/users';

export type SendEmailConfirmationMessageInputType = {
  user: TUserDb;
  confirmationCode?: string;
};
