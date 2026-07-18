import { Container } from 'inversify';

import {
  GetCommentByIdQueryHandler,
  GetPostCommentsQueryHandler,
} from './application/queries/comments.query-handlers';
import {
  CreateCommentUseCase,
  DeleteCommentUseCase,
  UpdateCommentLikeStatusUseCase,
  UpdateCommentUseCase,
} from './application/usecases/comments.usecases';
import { COMMENTS_TYPES } from './comments.tokens';
import { CommentControllers } from './controllers/comment-controllers';
import { CommentsRepository } from './repositories/CUD/comments-repository';
import { CommentsQueryRepository } from './repositories/Queries/comments-query-repository';

export const bindCommentsModule = (container: Container): void => {
  container.bind(COMMENTS_TYPES.ICommentsRepository).to(CommentsRepository);
  container
    .bind(COMMENTS_TYPES.ICommentsQueryRepository)
    .to(CommentsQueryRepository);

  container.bind(CreateCommentUseCase).toSelf();
  container.bind(UpdateCommentUseCase).toSelf();
  container.bind(UpdateCommentLikeStatusUseCase).toSelf();
  container.bind(DeleteCommentUseCase).toSelf();
  container.bind(GetPostCommentsQueryHandler).toSelf();
  container.bind(GetCommentByIdQueryHandler).toSelf();
  container.bind(CommentControllers).toSelf();
};
