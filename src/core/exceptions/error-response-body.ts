import type { DomainExceptionCode } from './domain-exception-code';
import type { Extension } from './extension';

export type ErrorResponseBody = {
  timestamp: string;
  path: string;
  message: string;
  code: DomainExceptionCode;
  extensions: Extension[];
};
