import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

import { LikeStatusRepository } from '@/core/repositories/like-status-repository';
import { settings } from '@/core/settings/index';
import { LikeStatus } from '@/core/types/common';

describe('LikeStatusRepository', () => {
  let mongoMemoryServer: MongoMemoryServer;
  let repository: LikeStatusRepository;

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoMemoryServer.getUri(), {
      dbName: settings.DB_NAME,
    });
    repository = new LikeStatusRepository();
  }, 60000);

  afterAll(async () => {
    await mongoose.connection.close();
    await mongoMemoryServer?.stop();
  });

  beforeEach(async () => {
    await mongoose.connection.db?.dropDatabase();
  });

  it('creates a like record on upsertLike', async () => {
    await repository.upsertLike({
      parentId: 'comment-1',
      parentType: 'comment',
      userId: 'user-1',
      likeStatus: LikeStatus.Like,
    });

    const status = await repository.findUserStatus('comment-1', 'user-1');
    expect(status).toBe(LikeStatus.Like);
  });

  it('updates like status and keeps counts in sync', async () => {
    await repository.upsertLike({
      parentId: 'post-1',
      parentType: 'post',
      userId: 'user-1',
      userLogin: 'user1',
      likeStatus: LikeStatus.Like,
    });
    await repository.upsertLike({
      parentId: 'post-1',
      parentType: 'post',
      userId: 'user-2',
      userLogin: 'user2',
      likeStatus: LikeStatus.Dislike,
    });

    let counts = await repository.countByParent('post-1');
    expect(counts).toEqual({ likesCount: 1, dislikesCount: 1 });

    await repository.upsertLike({
      parentId: 'post-1',
      parentType: 'post',
      userId: 'user-1',
      userLogin: 'user1',
      likeStatus: LikeStatus.Dislike,
    });

    counts = await repository.countByParent('post-1');
    expect(counts).toEqual({ likesCount: 0, dislikesCount: 2 });
  });

  it('is a no-op when upserting the same status', async () => {
    await repository.upsertLike({
      parentId: 'comment-2',
      parentType: 'comment',
      userId: 'user-1',
      likeStatus: LikeStatus.Like,
    });

    const before = await repository.findNewestLikes('comment-2', 1);

    await repository.upsertLike({
      parentId: 'comment-2',
      parentType: 'comment',
      userId: 'user-1',
      likeStatus: LikeStatus.Like,
    });

    const after = await repository.findNewestLikes('comment-2', 1);
    expect(after).toEqual(before);
    expect(await repository.countByParent('comment-2')).toEqual({
      likesCount: 1,
      dislikesCount: 0,
    });
  });

  it('removes record when status is None', async () => {
    await repository.upsertLike({
      parentId: 'post-2',
      parentType: 'post',
      userId: 'user-1',
      userLogin: 'user1',
      likeStatus: LikeStatus.Like,
    });

    await repository.upsertLike({
      parentId: 'post-2',
      parentType: 'post',
      userId: 'user-1',
      userLogin: 'user1',
      likeStatus: LikeStatus.None,
    });

    expect(await repository.findUserStatus('post-2', 'user-1')).toBe(
      LikeStatus.None,
    );
    expect(await repository.countByParent('post-2')).toEqual({
      likesCount: 0,
      dislikesCount: 0,
    });
  });

  it('returns batch user statuses with None as default', async () => {
    await repository.upsertLike({
      parentId: 'comment-3',
      parentType: 'comment',
      userId: 'user-1',
      likeStatus: LikeStatus.Dislike,
    });

    const statuses = await repository.findUserStatuses(
      ['comment-3', 'comment-4'],
      'user-1',
    );

    expect(statuses.get('comment-3')).toBe(LikeStatus.Dislike);
    expect(statuses.get('comment-4')).toBe(LikeStatus.None);
  });

  it('returns newest likes sorted by createdAt desc', async () => {
    await repository.upsertLike({
      parentId: 'post-3',
      parentType: 'post',
      userId: 'user-1',
      userLogin: 'user1',
      likeStatus: LikeStatus.Like,
    });
    await new Promise((resolve) => setTimeout(resolve, 5));
    await repository.upsertLike({
      parentId: 'post-3',
      parentType: 'post',
      userId: 'user-2',
      userLogin: 'user2',
      likeStatus: LikeStatus.Like,
    });

    const newestLikes = await repository.findNewestLikes('post-3', 2);

    expect(newestLikes).toHaveLength(2);
    expect(newestLikes[0]?.userId).toBe('user-2');
    expect(newestLikes[1]?.userId).toBe('user-1');
  });
});
