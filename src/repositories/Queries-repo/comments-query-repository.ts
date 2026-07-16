import {ObjectId} from 'mongodb';

import {TCommentDb} from "../../models/CommentsModels/GetCommentOutputModel";
// import {commentsCollection, postsCollection} from "../../store/db";
import {GetPostsInputModel} from "../../models/CommentsModels/GetPostCommentsInputModel";
import {calculateAndGetSkipValue} from "../../helpers";
import {Paginator, SortDirections} from "../../types/common";
import {postsQueryRepository} from "./posts-query-repository";
import CommentModel from "../../models/CommentsModels/Comment-model";


export const commentsQueryRepository = {
    async getPostComments({
                              sortBy,
                              sortDirection,
                              pageNumber,
                              pageSize,
                              postId
                           }: GetPostsInputModel) {
                              // : Promise<Paginator<GetCommentOutputModelFromMongoDB[]> | null> {
        try {
            const foundPost = await postsQueryRepository.findPostById(postId);
            if (!foundPost) return null;

            const skipValue = calculateAndGetSkipValue({pageNumber, pageSize});
            const filter = {postId};
            // const items = await commentsCollection
            //     .find(filter)
            //     .sort({[sortBy]: sortDirection === SortDirections.desc ? -1 : 1})
            //     .skip(skipValue)
            //     .limit(pageSize)
            //     .toArray();
            const items = await CommentModel
                .find(filter)
                .sort({[sortBy]: sortDirection === SortDirections.desc ? -1 : 1})
                .skip(skipValue)
                .limit(pageSize)
                .lean();
            // const totalCount = await commentsCollection.countDocuments(filter);
            const totalCount = await CommentModel.countDocuments(filter);
            const pagesCount = Math.ceil(totalCount / pageSize);
            return {
                pagesCount,
                page: pageNumber,
                pageSize,
                totalCount,
                items
            };
        } catch (error) {
            console.log(`commentsQueryRepository.getPostComments error is occurred: ${error}`)
            return {} as Paginator<TCommentDb[]>;
        }

    },

    async getCommentById(id: string): Promise<TCommentDb | null> {
    // async getCommentById(id: string): Promise<GetCommentOutputModelFromMongoDB | null> {
        try {
            // return await commentsCollection.findOne({_id: new ObjectId(id)})
            return await CommentModel.findOne({_id: new ObjectId(id)}).lean();
        } catch (error) {
            console.log(`commentsQueryRepository.getCommentById error is occurred: ${error}`)
            return null
        }
    },
}