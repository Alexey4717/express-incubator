import {ObjectId} from "mongodb";

import {blogsCollection} from '../../store/db';
import {GetBlogOutputModelFromMongoDB} from "../../models/BlogModels/GetBlogOutputModel";
import {SortDirections, GetBlogsArgs, GetPostsInBlogArgs, Paginator} from "../../types/common";
import {calculateAndGetSkipValue} from "../../helpers";
import {GetPostOutputModelFromMongoDB, TPostDb} from "../../models/PostModels/GetPostOutputModel";
import PostModel from "../../models/PostModels/Post-model";


export const blogsQueryRepository = {
    async getBlogs({
                       searchNameTerm,
                       sortBy,
                       sortDirection,
                       pageNumber,
                       pageSize
                   }
                       : GetBlogsArgs): Promise<Paginator<GetBlogOutputModelFromMongoDB[]>> {
        try {
            const filter = searchNameTerm ? {name: {$regex: searchNameTerm, $options: 'i'}} : {};
            const skipValue = calculateAndGetSkipValue({pageNumber, pageSize});
            const items = await blogsCollection
                .find(filter)
                .sort({[sortBy]: sortDirection === SortDirections.desc ? -1 : 1})
                .skip(skipValue)
                .limit(pageSize)
                .toArray();
            const totalCount = await blogsCollection.count(filter);
            const pagesCount = Math.ceil(totalCount / pageSize);
            return {
                page: pageNumber,
                pageSize,
                totalCount,
                pagesCount,
                items
            }
        } catch (error) {
            console.log(`BlogsQueryRepository get blogs error is occurred: ${error}`);
            return {} as Paginator<GetBlogOutputModelFromMongoDB[]>;
        }
    },

    async getPostsInBlog({
                             blogId,
                             sortBy,
                             sortDirection,
                             pageNumber,
                             pageSize
                         }: GetPostsInBlogArgs): Promise<Paginator<TPostDb[]> | null> {
        try {
            const foundBlog = await blogsCollection.findOne({"_id": new ObjectId(blogId)});
            if (!foundBlog) return null;
            const skipValue = calculateAndGetSkipValue({pageNumber, pageSize});
            const filter = {blogId: {$regex: blogId}}
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
            }
        } catch (error) {
            console.log(`BlogsQueryRepository.getPostsInBlog error is occurred: ${error}`);
            return null;
        }
    },

    async findBlogById(id: string): Promise<GetBlogOutputModelFromMongoDB | null> {
        try {
            const foundBlog = await blogsCollection.findOne({"_id": new ObjectId(id)});
            return foundBlog ?? null;
        } catch (error) {
            console.log(`BlogsQueryRepository find blog by id error is occurred: ${error}`);
            return null;
        }
    },
};
