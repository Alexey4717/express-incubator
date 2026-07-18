import { Response } from 'express';

import { ResultStatus } from './result-code';
import { resultCodeToHttpStatus } from './result-code-to-http-exception';
import { ExtensionType, Result } from './result.type';

export function ok<T>(data: T): Result<T> {
  return { status: ResultStatus.Success, data };
}

export function fail<T = null>(
  status: Exclude<ResultStatus, ResultStatus.Success>,
  extensions?: ExtensionType,
  errorMessage?: string,
): Result<T> {
  return { status, extensions, errorMessage };
}

export function isFailure<T>(result: Result<T>): result is Result<T> & {
  status: Exclude<ResultStatus, ResultStatus.Success>;
} {
  return result.status !== ResultStatus.Success;
}

export function sendFailure(res: Response, result: Result<unknown>): void {
  const statusCode = resultCodeToHttpStatus(result.status);

  if (result.extensions || result.errorMessage) {
    res.status(statusCode).json({
      ...(result.errorMessage && { message: result.errorMessage }),
      ...(result.extensions && { extensions: result.extensions }),
    });
    return;
  }

  res.sendStatus(statusCode);
}
