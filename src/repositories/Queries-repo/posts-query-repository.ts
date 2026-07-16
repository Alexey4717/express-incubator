import {ObjectId} from "mongodb";

import {GetPostOutputModelFromMongoDB, TPostDb} from "../../models/PostModels/GetPostOutputModel";
// import {postsCollection} from "../../store/db";
import {Paginator, GetPostsArgs, SortDirections} from "../../types/common";
import {calculateAndGetSkipValue} from "../../helpers";
import PostModel from "../../models/PostModels/Post-model";


export const postsQueryRepository = {
    async getPosts({
                       sortBy,
                       sortDirection,
                       pageNumber,
                       pageSize
                   }: GetPostsArgs): Promise<Paginator<TPostDb[]>> {
        try {
            const skipValue = calculateAndGetSkipValue({pageNumber, pageSize});
            const filter = {};
            const items = await PostModel
                .find(filter)
                .sort({[sortBy]: sortDirection === SortDirections.desc ? -1 : 1})
                .skip(skipValue)
                .limit(pageSize)
                .lean();
            const totalCount = await PostModel.countDocuments(filter);
            const pagesCount = Math.ceil(totalCount / pageSize);
            return {
                page: pageNumber,
                pageSize,
                totalCount,
                pagesCount,
                items
            };
        } catch (error) {
            console.log(`postsQueryRepository.getPosts error is occurred: ${error}`);
            return {} as Paginator<TPostDb[]>;
        }
    },

    async findPostById(id: string): Promise<TPostDb | null> {
        try {
            const foundPost = await PostModel.findOne({"_id": new ObjectId(id)}).lean();
            return foundPost ?? null;
        } catch (error) {
            console.log(`postsQueryRepository.findPostById error is occurred: ${error}`);
            return null;
        }
    },
};
