import { NextFunction, Request, Response } from 'express';

import { ValidationError, validationResult } from 'express-validator';
import { constants } from 'http2';

import { GetErrorOutputModel } from '../models/GetErrorOutputModel';

export const inputValidationsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const errorFormatter = (error: ValidationError) => {
      return {
        message: error.msg,
        field: error.type === 'field' ? error.path : 'unknown',
      };
    };

    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      const errorsBody: GetErrorOutputModel = {
        errorsMessages: errors.array({ onlyFirstError: true }),
      };
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json(errorsBody);
    }

    next();
  } catch (error) {
    console.log(`Input validation body error is occurred: ${error}`);
  }
};
