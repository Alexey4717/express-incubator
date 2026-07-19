import { DomainExceptionCode } from './domain-exception-code';
import type { Extension } from './extension';

export type DomainExceptionOptions = {
  code: DomainExceptionCode;
  message: string;
  extensions?: Extension[];
};

export class DomainException extends Error {
  readonly code: DomainExceptionCode;
  readonly extensions: Extension[];

  constructor(options: DomainExceptionOptions) {
    super(options.message);
    this.name = 'DomainException';
    this.code = options.code;
    this.extensions = options.extensions ?? [];
  }
}

export function domainException(
  code: DomainExceptionCode,
  reason: string,
  message?: string,
): DomainException {
  return new DomainException({
    code,
    message: message ?? reason,
    extensions: [{ key: 'reason', message: reason }],
  });
}
