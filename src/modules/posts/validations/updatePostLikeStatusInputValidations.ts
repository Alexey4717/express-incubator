import { commonValidationForBodyStrings } from '@/core/validations/common';

import type { PostValidators } from './post-shared-validators';

export const createUpdatePostLikeStatusInputValidations = ({
  postLikeStatusValidation,
}: Pick<PostValidators, 'postLikeStatusValidation'>) => [
  commonValidationForBodyStrings('likeStatus'),
  postLikeStatusValidation,
];
