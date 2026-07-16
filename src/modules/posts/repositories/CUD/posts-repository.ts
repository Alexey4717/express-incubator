import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';
import { HydratedDocument } from 'mongoose';

import { LikeStatus } from '../../../../core/types/common';
import { TPostDb } from '../../../posts/models/PostModels/GetPostOutputModel';
import { TReactions } from '../../../posts/models/PostModels/GetPostOutputModel';
import PostModel from '../../../posts/models/PostModels/Post-model';
import { UpdatePostInputModel } from '../../../posts/models/PostModels/UpdatePostInputModel';
import { PostsQueryRepository } from '../Queries/posts-query-repository';

interface UpdatePostArgs {
  id: string;
  input: UpdatePostInputModel;
}

interface UpdateLikeStatusPostArgs {
  postId: string;
  userId: string;
  userLogin: string;
  likeStatus: LikeStatus;
}

@injectable()
export class PostsRepository {
  constructor(protected postsQueryRepository: PostsQueryRepository) {}

  async createPost(
    newPost: HydratedDocument<TPostDb>,
  ): Promise<HydratedDocument<TPostDb> | false> {
    try {
      return await newPost.save();
    } catch (error) {
      console.log(`PostsRepository.createPost error is occurred: ${error}`);
      return false;
    }
  }

  async updatePost({ id, input }: UpdatePostArgs): Promise<boolean> {
    try {
      const response = await PostModel.updateOne(
        { _id: new ObjectId(id) },
        { $set: input },
      );
      return response.matchedCount === 1;
    } catch (error) {
      console.log(`PostsRepository.updatePost error is occurred: ${error}`);
      return false;
    }
  }

  async updatePostLikeStatus({
    postId,
    userId,
    userLogin,
    likeStatus,
  }: UpdateLikeStatusPostArgs): Promise<boolean> {
    try {
      const filter = { _id: new ObjectId(postId) };
      const foundPost = await this.postsQueryRepository.findPostById(postId);

      if (!foundPost) return false;

      const foundPostLikeStatus = foundPost.reactions.find(
        (likeStatus: TReactions) => likeStatus.userId === userId,
      );

      if (!foundPostLikeStatus) {
        const newPostLikeStatus: TReactions = {
          userId,
          userLogin,
          likeStatus,
          createdAt: new Date().toISOString(),
        };

        const result = await PostModel.updateOne(filter, {
          $push: { reactions: newPostLikeStatus },
        });
        return result.matchedCount === 1;
      }

      if (foundPostLikeStatus.likeStatus === likeStatus) return true;

      const result = await PostModel.updateOne(
        { ...filter, 'reactions.userId': userId },
        {
          $set: {
            'reactions.$.likeStatus': likeStatus,
            'reactions.$.createdAt': new Date().toISOString(),
          },
        },
      );

      return result.matchedCount === 1;
    } catch (error) {
      console.log(
        'PostsRepository.updatePostLikeStatus error is occurred: ',
        error,
      );
      return false;
    }
  }

  async deletePostById(id: string): Promise<boolean> {
    try {
      const result = await PostModel.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (error) {
      console.log(`PostsRepository.deletePostById error is occurred: ${error}`);
      return false;
    }
  }
}
