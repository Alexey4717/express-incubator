import type { CheckCredentialsInputArgs } from '@/core/types/common';

export class CheckCredentialsCommand {
  constructor(public readonly input: CheckCredentialsInputArgs) {}
}
