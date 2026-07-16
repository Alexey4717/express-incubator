import {ObjectId} from 'mongodb';

import {CreateBlogInputModel} from "../models/BlogModels/CreateBlogInputModel";
import {GetBlogOutputModelFromMongoDB} from "../models/BlogModels/GetBlogOutputModel";
import {UpdateBlogInputModel} from "../models/BlogModels/UpdateBlogInputModel";
import {blogsRepository} from "../repositories/CUD-repo/blogs-repository";
import {
    CreatePostInBlogInputAndQueryModel
} from "../models/BlogModels/CreatePostInBlogInputModel";
import {blogsQueryRepository} from "../repositories/Queries-repo/blogs-query-repository";
import {GetPostOutputModelFromMongoDB, TPostDb} from "../models/PostModels/GetPostOutputModel";

interface UpdateBlogArgs {
    id: string
    input: UpdateBlogInputModel
}

export const blogsService = {
    async createBlog(input: CreateBlogInputModel): Promise<GetBlogOutputModelFromMongoDB> {
        const {
            name,
            websiteUrl,
            description
        } = input || {};

        const newBlog = {
            name,
            websiteUrl,
            description,
            isMembership: false,
            createdAt: new Date().toISOString()
        };

        await blogsRepository.createBlog(newBlog);
        return newBlog as GetBlogOutputModelFromMongoDB;
    },

    async createPostInBlog({
                               blogId,
                               input
                           }: CreatePostInBlogInputAndQueryModel): Promise<TPostDb | null> {
        const {
            title,
            shortDescription,
            content
        } = input || {};

        const foundBlog = await blogsQueryRepository.findBlogById(blogId);

        if (!foundBlog) return null;

        const newPost: TPostDb = {
            _id: new ObjectId(),
            title,
            shortDescription,
            blogId,
            blogName: foundBlog.name,
            content,
            createdAt: new Date().toISOString(),
            reactions: [],
        };

        await blogsRepository.createPostInBlog(newPost);
        return newPost as TPostDb;
    },

    async updateBlog({id, input}: UpdateBlogArgs): Promise<boolean> {
        return await blogsRepository.updateBlog({id, input});
    },

    async deleteBlogById(id: string): Promise<boolean> {
        return await blogsRepository.deleteBlogById(id);
    }
};
