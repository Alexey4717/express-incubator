import { query } from 'express-validator';

import { SortDirections } from '../types/common';

export const paginationAndSortingValidation = <T extends string>(
  sortFields: readonly T[],
) => {
  const defaultSortBy = sortFields[0];

  return [
    query('pageNumber')
      .optional()
      .default('1')
      .isInt({ min: 1 })
      .withMessage('pageNumber must be a positive integer')
      .toInt(),
    query('pageSize')
      .optional()
      .default('10')
      .isInt({ min: 1, max: 100 })
      .withMessage('pageSize must be an integer from 1 to 100')
      .toInt(),
    query('sortBy')
      .optional()
      .default(defaultSortBy)
      .isIn([...sortFields])
      .withMessage(`sortBy must be one of: ${sortFields.join(', ')}`),
    query('sortDirection')
      .optional()
      .default(SortDirections.desc)
      .isIn(Object.values(SortDirections))
      .withMessage('sortDirection must be asc or desc'),
  ];
};

export const blogsSearchValidation = () => [
  query('searchNameTerm')
    .optional({ values: 'null' })
    .default(null)
    .custom((value) => value === null || typeof value === 'string')
    .withMessage('searchNameTerm must be a string or null'),
];

export const usersSearchValidation = () => [
  query('searchLoginTerm')
    .optional({ values: 'null' })
    .default(null)
    .custom((value) => value === null || typeof value === 'string')
    .withMessage('searchLoginTerm must be a string or null'),
  query('searchEmailTerm')
    .optional({ values: 'null' })
    .default(null)
    .custom((value) => value === null || typeof value === 'string')
    .withMessage('searchEmailTerm must be a string or null'),
];
