import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { calculateAndGetSkipValue } from '../../../../core/helpers';
import {
  GetBlogsArgs,
  GetPostsInBlogArgs,
  Paginator,
  SortDirections,
} from '../../../../core/types/common';
import BlogModel from '../../../blogs/models/BlogModels/Blog-model';
import { GetBlogOutputModelFromMongoDB } from '../../../blogs/models/BlogModels/GetBlogOutputModel';
import { TPostDb } from '../../../posts/models/PostModels/GetPostOutputModel';
import PostModel from '../../../posts/models/PostModels/Post-model';

@injectable()
export class BlogsQueryRepository {
  async getBlogs({
    searchNameTerm,
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
  }: GetBlogsArgs): Promise<Paginator<GetBlogOutputModelFromMongoDB[]>> {
    try {
      const filter = searchNameTerm
        ? { name: { $regex: searchNameTerm, $options: 'i' } }
        : {};
      const skipValue = calculateAndGetSkipValue({ pageNumber, pageSize });
      const items = await BlogModel.find(filter)
        .sort({ [sortBy]: sortDirection === SortDirections.desc ? -1 : 1 })
        .skip(skipValue)
        .limit(pageSize)
        .lean();
      const totalCount = await BlogModel.countDocuments(filter);
      const pagesCount = Math.ceil(totalCount / pageSize);
      return {
        page: pageNumber,
        pageSize,
        totalCount,
        pagesCount,
        items,
      };
    } catch (error) {
      console.log(`BlogsQueryRepository get blogs error is occurred: ${error}`);
      return {} as Paginator<GetBlogOutputModelFromMongoDB[]>;
    }
  }

  async getPostsInBlog({
    blogId,
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
  }: GetPostsInBlogArgs): Promise<Paginator<TPostDb[]> | null> {
    try {
      const foundBlog = await BlogModel.findOne({
        _id: new ObjectId(blogId),
      }).lean();
      if (!foundBlog) return null;
      const skipValue = calculateAndGetSkipValue({ pageNumber, pageSize });
      const filter = { blogId: { $regex: blogId } };
      const items = await PostModel.find(filter)
        .sort({ [sortBy]: sortDirection === SortDirections.desc ? -1 : 1 })
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
        items,
      };
    } catch (error) {
      console.log(
        `BlogsQueryRepository.getPostsInBlog error is occurred: ${error}`,
      );
      return null;
    }
  }

  async findBlogById(
    id: string,
  ): Promise<GetBlogOutputModelFromMongoDB | null> {
    try {
      const foundBlog = await BlogModel.findOne({
        _id: new ObjectId(id),
      }).lean();
      return foundBlog ?? null;
    } catch (error) {
      console.log(
        `BlogsQueryRepository find blog by id error is occurred: ${error}`,
      );
      return null;
    }
  }
}
