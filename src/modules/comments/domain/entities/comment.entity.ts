import { ObjectId } from 'mongodb';

import { domainException } from '@/core/exceptions/domain-exception';
import { DomainExceptionCode } from '@/core/exceptions/domain-exception-code';
import type { LikeCounts } from '@/core/repositories/contracts/ILikeStatusRepository';

import type { TCommentDb } from '../../models/GetCommentOutputModel';

export type CommentCreateProps = {
  postId: string;
  userId: string;
  userLogin: string;
  content: string;
};

export class CommentEntity {
  private constructor(private data: TCommentDb) {}

  static create(props: CommentCreateProps): CommentEntity {
    return new CommentEntity({
      _id: new ObjectId(),
      postId: props.postId,
      content: props.content,
      commentatorInfo: {
        userId: props.userId,
        userLogin: props.userLogin,
      },
      createdAt: new Date().toISOString(),
      likesCount: 0,
      dislikesCount: 0,
    });
  }

  static reconstitute(raw: TCommentDb): CommentEntity {
    return new CommentEntity({ ...raw, _id: raw._id });
  }

  get id(): ObjectId {
    return this.data._id;
  }

  toDb(): TCommentDb {
    return { ...this.data };
  }

  canBeModifiedBy(userId: string): void {
    if (this.data.commentatorInfo.userId !== userId) {
      throw domainException(DomainExceptionCode.Forbidden, 'NotOwner');
    }
  }

  update(content: string): void {
    this.data = { ...this.data, content };
  }

  applyLikeCounts(counts: LikeCounts): void {
    this.data = {
      ...this.data,
      likesCount: counts.likesCount,
      dislikesCount: counts.dislikesCount,
    };
  }
}
