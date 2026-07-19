import { ErrorRequestHandler } from 'express';

import { isProduction } from '../../settings/env';
import { DomainException } from '../domain-exception';
import { DomainExceptionCode } from '../domain-exception-code';
import type { ErrorResponseBody } from '../error-response-body';
import { mapDomainExceptionCodeToHttpStatus } from './domain-exception.mapper';

export const createGlobalExceptionFilter = (): ErrorRequestHandler => {
  return (error, req, res, _next) => {
    if (error instanceof DomainException) {
      const body: ErrorResponseBody = {
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        message: error.message,
        code: error.code,
        extensions: error.extensions,
      };

      res.status(mapDomainExceptionCodeToHttpStatus(error.code)).json(body);
      return;
    }

    const body: ErrorResponseBody = {
      timestamp: new Date().toISOString(),
      path: isProduction() ? '' : req.originalUrl,
      message: isProduction()
        ? 'Internal server error'
        : error instanceof Error
          ? error.message
          : 'Internal server error',
      code: DomainExceptionCode.InternalServerError,
      extensions: [],
    };

    res.status(mapDomainExceptionCodeToHttpStatus(body.code)).json(body);
  };
};
