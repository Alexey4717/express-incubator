import { commonValidationForBodyStrings } from '@/core/validations/common';

import type { PostValidators } from '../../posts/validations/post-shared-validators';

export const createPostInBlogInputValidations = ({
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
];
