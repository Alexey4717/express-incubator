import {ObjectId} from "mongodb";

import {UpdatePostInputModel} from "../../models/PostModels/UpdatePostInputModel";
// import {postsCollection} from "../../store/db";
import {TPostDb} from "../../models/PostModels/GetPostOutputModel";
import PostModel from '../../models/PostModels/Post-model';
import {LikeStatus} from "../../types/common";
import {postsQueryRepository} from "../Queries-repo/posts-query-repository";
import {TReactions} from "../../models/PostModels/GetPostOutputModel";
import {Model} from "mongoose";


interface UpdatePostArgs {
    id: string
    input: UpdatePostInputModel
}

interface UpdateLikeStatusPostArgs {
    postId: string
    userId: string
    userLogin: string
    likeStatus: LikeStatus
}

export const postsRepository = {
    async createPost(newPost: any): Promise<any> {
        try {
            return await newPost.save();
            // return true;
            // const result = await postsCollection.insertOne(newPost);
            // return Boolean(result.insertedId);
        } catch (error) {
            console.log(`postsRepository.createPost error is occurred: ${error}`);
            return false;
        }
    },

    async updatePost({id, input}: UpdatePostArgs): Promise<boolean> {
        try {
            const response = await PostModel.updateOne(
                {"_id": new ObjectId(id)},
                {$set: input}
            );
            return response.matchedCount === 1;
        } catch (error) {
            console.log(`postsRepository.updatePost error is occurred: ${error}`);
            return false;
        }
    },

    async updatePostLikeStatus({postId, userId, userLogin, likeStatus}: UpdateLikeStatusPostArgs): Promise<boolean> {
        try {
            const filter = {_id: new ObjectId(postId)};
            const foundPost = await postsQueryRepository.findPostById(postId);

            if (!foundPost) return false;

            const foundPostLikeStatus = foundPost.reactions.find((likeStatus: TReactions) => likeStatus.userId === userId);

            if (!foundPostLikeStatus) {
                const newPostLikeStatus: TReactions = {
                    userId,
                    userLogin,
                    likeStatus,
                    createdAt: new Date().toISOString()
                };

                const result = await PostModel.updateOne(
                    filter,
                    {$push: {reactions: newPostLikeStatus}},
                )
                return result.matchedCount === 1;
            }

            if (foundPostLikeStatus.likeStatus === likeStatus) return true;

            const result = await PostModel.updateOne(
                {...filter, 'reactions.userId': userId},
                {
                    $set: {
                        'reactions.$.likeStatus': likeStatus,
                        'reactions.$.createdAt': new Date().toISOString()
                    }
                }
            )

            return result.matchedCount === 1;
        } catch (error) {
            console.log('postsRepository.updatePostLikeStatus error is occurred: ', error);
            return false;
        }
    },

    async deletePostById(id: string): Promise<boolean> {
        try {
            const result = await PostModel.deleteOne({"_id": new ObjectId(id)});
            return result.deletedCount === 1;
        } catch (error) {
            console.log(`postsRepository.deletePostById error is occurred: ${error}`);
            return false;
        }
    }
};
