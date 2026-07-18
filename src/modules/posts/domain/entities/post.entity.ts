import { ObjectId } from 'mongodb';

import type { LikeCounts } from '@/core/repositories/contracts/ILikeStatusRepository';

import { CreatePostInputModel } from '../../models/CreatePostInputModel';
import type { TPostDb } from '../../models/GetPostOutputModel';

export type PostUpdateProps = Pick<
  TPostDb,
  'title' | 'shortDescription' | 'content' | 'blogId'
>;

export class PostEntity {
  private constructor(private data: TPostDb) {}

  static create(
    input: Pick<
      CreatePostInputModel,
      'title' | 'shortDescription' | 'content' | 'blogId'
    >,
    blogName: string,
  ): PostEntity {
    return new PostEntity({
      _id: new ObjectId(),
      title: input.title,
      shortDescription: input.shortDescription,
      content: input.content,
      blogId: input.blogId,
      blogName,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      dislikesCount: 0,
    });
  }

  static reconstitute(raw: TPostDb): PostEntity {
    return new PostEntity({ ...raw, _id: raw._id });
  }

  get id(): ObjectId {
    return this.data._id;
  }

  toDb(): TPostDb {
    return { ...this.data };
  }

  update(props: PostUpdateProps, blogName: string): void {
    this.data = {
      ...this.data,
      ...props,
      blogName,
    };
  }

  applyLikeCounts(counts: LikeCounts): void {
    this.data = {
      ...this.data,
      likesCount: counts.likesCount,
      dislikesCount: counts.dislikesCount,
    };
  }
}
