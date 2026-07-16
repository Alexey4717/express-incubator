import { SendEmailInputType } from '../../src/core/adapters/types';

export const emailAdapter = {
  async sendEmail(_input: SendEmailInputType): Promise<boolean> {
    return true;
  },
};
