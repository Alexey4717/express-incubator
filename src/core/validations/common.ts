// validation for uri params
import { body, param } from 'express-validator';

export const commonValidationForBodyStrings = (name: string) =>
  body(name)
    .exists()
    .isString()
    .withMessage('Field should be a string')
    .trim()
    .notEmpty()
    .withMessage('Field shouldn`t be empty');

export const mongoIdParamValidation = (paramName = 'id') =>
  param(paramName)
    .exists()
    .withMessage('ID is required')
    .isString()
    .withMessage('ID must be a string')
    .isMongoId()
    .withMessage('Incorrect format of ObjectId');
