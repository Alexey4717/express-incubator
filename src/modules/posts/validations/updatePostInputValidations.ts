import { commonValidationForBodyStrings } from '@/core/validations/common';

import type { PostValidators } from './post-shared-validators';

export const createUpdatePostInputValidations = ({
  titleValidation,
  shortDescriptionValidation,
  contentValidation,
}: Pick<
  PostValidators,
  'titleValidation' | 'shortDescriptionValidation' | 'contentValidation'
>) => [
  commonValidationForBodyStrings('title'),
  titleValidation,
  commonValidationForBodyStrings('shortDescription'),
  shortDescriptionValidation,
  commonValidationForBodyStrings('content'),
  contentValidation,
  commonValidationForBodyStrings('blogId'),
];
