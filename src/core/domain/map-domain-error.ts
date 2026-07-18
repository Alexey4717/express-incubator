import { fail } from '../result/handle-result';
import { ResultStatus } from '../result/result-code';
import type { Result } from '../result/result.type';
import { DomainError } from './domain-error';

const forbiddenReasons = new Set(['NotOwner']);

export function mapDomainError<T = null>(error: unknown): Result<T> {
  if (error instanceof DomainError) {
    const status = forbiddenReasons.has(error.reason)
      ? ResultStatus.Forbidden
      : ResultStatus.BadRequest;
    return fail(status, { reason: error.reason });
  }
  throw error;
}
