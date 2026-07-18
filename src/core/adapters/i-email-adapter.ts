import { SendEmailInputType } from './types';

export interface IEmailAdapter {
  sendEmail(input: SendEmailInputType): Promise<boolean>;
}
