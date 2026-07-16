import {Response} from "express";
import {constants} from "http2";

import {
    Paginator,
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery,
    SortDirections
} from "../types/common";
import {GetBlogsInputModel, SortBlogsBy} from "../models/BlogModels/GetBlogsInputModel";
import {GetMappedBlogOutputModel} from "../models/BlogModels/GetBlogOutputModel";
import {blogsQueryRepository} from "../repositories/Queries-repo/blogs-query-repository";
import {getMappedBlogViewModel, getMappedPostViewModel} from "../helpers";
import {GetPostsInputModel, SortPostsBy} from "../models/PostModels/GetPostsInputModel";
import {GetMappedPostOutputModel} from "../models/PostModels/GetPostOutputModel";
import {CreateBlogInputModel} from "../models/BlogModels/CreateBlogInputModel";
import {blogsService} from "../domain/blogs-service";
import {CreatePostInBlogInputModel} from "../models/BlogModels/CreatePostInBlogInputModel";
import {UpdateBlogInputModel} from "../models/BlogModels/UpdateBlogInputModel";
import {ObjectId} from "mongodb";


export const blogControllers = {
    async getBlogs(
        req: RequestWithQuery<GetBlogsInputModel>,
        res: Response<Paginator<GetMappedBlogOutputModel[]>>
    ) {
        const resData = await blogsQueryRepository.getBlogs({
            searchNameTerm: req.query.searchNameTerm?.toString() || null, // by-default null
            sortBy: (req.query.sortBy?.toString() || 'createdAt') as SortBlogsBy, // by-default createdAt
            sortDirection: (req.query.sortDirection?.toString() || SortDirections.desc) as SortDirections, // by-default desc
            pageNumber: +(req.query.pageNumber || 1), // by-default 1,
            pageSize: +(req.query.pageSize || 10) // by-default 10
        });
        const {
            pagesCount,
            page,
            pageSize,
            totalCount,
            items
        } = resData || {};
        res.status(constants.HTTP_STATUS_OK).json({
            pagesCount,
            page,
            pageSize,
            totalCount,
            items: items.map(getMappedBlogViewModel)
        });
    },

    async getBlog(
        req: RequestWithParams<{ id: string }>,
        res: Response<GetMappedBlogOutputModel>
    ) {
        const resData = await blogsQueryRepository.findBlogById(req.params.id);
        if (!resData) {
            res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
            return;
        }
        res.status(constants.HTTP_STATUS_OK).json(getMappedBlogViewModel(resData));
    },

    async getPostsOfBlog(
        req: RequestWithParamsAndQuery<{ id: string }, GetPostsInputModel>,
        res: Response<Paginator<GetMappedPostOutputModel[]>>
    ) {
        const currentUserId = req?.context?.user?._id
            ? new ObjectId(req.context.user?._id).toString()
            : undefined;

        const resData = await blogsQueryRepository.getPostsInBlog({
            blogId: req.params.id,
            sortBy: (req.query.sortBy?.toString() || 'createdAt') as SortPostsBy, // by-default createdAt
            sortDirection: (req.query.sortDirection?.toString() || SortDirections.desc) as SortDirections, // by-default desc
            pageNumber: +(req.query.pageNumber || 1), // by-default 1
            pageSize: +(req.query.pageSize || 10) // by-default 10
        });

        if (!resData) {
            res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
            return;
        }

        const {
            pagesCount,
            page,
            pageSize,
            totalCount,
            items
        } = resData || {};

        const itemsWithCurrentUserId = items.map(item => ({...item, currentUserId}));

        res.status(constants.HTTP_STATUS_OK).json({
            pagesCount,
            page,
            pageSize,
            totalCount,
            items: itemsWithCurrentUserId.map(getMappedPostViewModel)
        });
    },

    async createBlog(
        req: RequestWithBody<CreateBlogInputModel>,
        res: Response<GetMappedBlogOutputModel>
    ) {
        const createdBlog = await blogsService.createBlog(req.body);
        res.status(constants.HTTP_STATUS_CREATED).json(getMappedBlogViewModel(createdBlog));
    },

    async createPostInBlog(
        req: RequestWithParamsAndBody<{ id: string }, CreatePostInBlogInputModel>,
        res: Response<GetMappedPostOutputModel>
    ) {
        const currentUserId = req?.context?.user?._id
            ? new ObjectId(req.context.user?._id).toString()
            : undefined;

        const createdPostInBlog = await blogsService.createPostInBlog({
            blogId: req.params.id,
            input: req.body
        });

        // Если по какой-то причине не найден блог
        if (!createdPostInBlog) {
            res.sendStatus(constants.HTTP_STATUS_NOT_FOUND)
            return;
        }
        res.status(constants.HTTP_STATUS_CREATED).json(getMappedPostViewModel({
            ...createdPostInBlog,
            currentUserId
        }));
    },

    async updateBlog(
        req: RequestWithParamsAndBody<{ id: string }, UpdateBlogInputModel>,
        res: Response
    ) {
        const isBlogUpdated = await blogsService.updateBlog({id: req.params.id, input: req.body});
        if (!isBlogUpdated) {
            res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
            return;
        }

        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT)
    },

    async deleteBlog(
        req: RequestWithParams<{ id: string }>,
        res: Response<void>
    ) {
        const resData = await blogsService.deleteBlogById(req.params.id);
        if (!resData) {
            res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
            return;
        }
        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
    }
};
