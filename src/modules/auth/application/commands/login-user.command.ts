import type { CheckCredentialsInputArgs } from '@/core/types/common';

export class LoginUserCommand {
  constructor(
    public readonly input: CheckCredentialsInputArgs & {
      userAgent: string;
      ip: string;
    },
  ) {}
}
