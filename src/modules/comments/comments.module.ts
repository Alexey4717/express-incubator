import { Container } from 'inversify';

import { COMMENTS_TYPES } from './comments.tokens';
import { CommentControllers } from './controllers/comment-controllers';
import { CommentsRepository } from './repositories/CUD/comments-repository';
import { CommentsQueryRepository } from './repositories/Queries/comments-query-repository';
import { CommentsService } from './services/comments-service';

export const bindCommentsModule = (container: Container): void => {
  container.bind(COMMENTS_TYPES.ICommentsRepository).to(CommentsRepository);
  container
    .bind(COMMENTS_TYPES.ICommentsQueryRepository)
    .to(CommentsQueryRepository);
  container.bind(CommentsService).toSelf();
  container.bind(CommentControllers).toSelf();
};
