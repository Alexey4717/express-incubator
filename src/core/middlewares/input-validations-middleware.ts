import { NextFunction, Request, Response } from 'express';

import { ValidationError, validationResult } from 'express-validator';

import { DomainException } from '../exceptions/domain-exception';
import { DomainExceptionCode } from '../exceptions/domain-exception-code';

export const inputValidationsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const errorFormatter = (error: ValidationError) => {
      return {
        message: error.msg,
        key: error.type === 'field' ? error.path : 'unknown',
      };
    };

    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array({ onlyFirstError: true });
      throw new DomainException({
        code: DomainExceptionCode.ValidationError,
        message: 'Validation failed',
        extensions: formattedErrors.map(({ key, message }) => ({
          key,
          message,
        })),
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
