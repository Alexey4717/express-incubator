import { LikeStatusEntity } from '@/core/domain/entities/like-status.entity';
import { LikeStatus } from '@/core/types/common';

describe('LikeStatusEntity', () => {
  const existingLike = {
    parentId: 'post-1',
    parentType: 'post' as const,
    userId: 'user-1',
    userLogin: 'user1',
    likeStatus: LikeStatus.Like,
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  it('returns delete action when status is None and record exists', () => {
    const action = LikeStatusEntity.resolveUpsert({
      existing: existingLike,
      parentId: 'post-1',
      parentType: 'post',
      userId: 'user-1',
      likeStatus: LikeStatus.None,
    });

    expect(action).toEqual({ type: 'delete' });
  });

  it('returns noop when status is None and record does not exist', () => {
    const action = LikeStatusEntity.resolveUpsert({
      existing: null,
      parentId: 'post-1',
      parentType: 'post',
      userId: 'user-1',
      likeStatus: LikeStatus.None,
    });

    expect(action).toEqual({ type: 'noop' });
  });

  it('returns create action when record does not exist', () => {
    const action = LikeStatusEntity.resolveUpsert({
      existing: null,
      parentId: 'post-1',
      parentType: 'post',
      userId: 'user-1',
      userLogin: 'user1',
      likeStatus: LikeStatus.Like,
    });

    expect(action.type).toBe('create');
    if (action.type === 'create') {
      expect(action.record.likeStatus).toBe(LikeStatus.Like);
      expect(action.record.userLogin).toBe('user1');
    }
  });

  it('returns noop when upserting the same status', () => {
    const action = LikeStatusEntity.resolveUpsert({
      existing: existingLike,
      parentId: 'post-1',
      parentType: 'post',
      userId: 'user-1',
      likeStatus: LikeStatus.Like,
    });

    expect(action).toEqual({ type: 'noop' });
  });

  it('returns update action when status changes', () => {
    const action = LikeStatusEntity.resolveUpsert({
      existing: existingLike,
      parentId: 'post-1',
      parentType: 'post',
      userId: 'user-1',
      userLogin: 'user1',
      likeStatus: LikeStatus.Dislike,
    });

    expect(action.type).toBe('update');
    if (action.type === 'update') {
      expect(action.likeStatus).toBe(LikeStatus.Dislike);
    }
  });
});
