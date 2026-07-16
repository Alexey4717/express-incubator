import { commonValidationForBodyStrings } from '@/core/validations/common';

import type { PostValidators } from './post-shared-validators';

export const createCreatePostInputValidations = ({
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
  blogIdValidation,
}: Pick<
  PostValidators,
  | 'titleValidation'
  | 'shortDescriptionValidation'
  | 'contentValidation'
  | 'blogIdValidation'
>) => [
  commonValidationForBodyStrings('title'),
  titleValidation,
  commonValidationForBodyStrings('shortDescription'),
  shortDescriptionValidation,
  commonValidationForBodyStrings('content'),
  contentValidation,
  commonValidationForBodyStrings('blogId'),
  blogIdValidation,
];
