import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { calculateAndGetSkipValue } from '@/core/helpers';
import { PaginatedQueryResult, SortDirections } from '@/core/types/common';

import { getMappedPostViewModel } from '../../../posts/helpers/map-to-post-output';
import { GetMappedPostOutputModel } from '../../../posts/models/GetPostOutputModel';
import PostModel from '../../../posts/models/Post-model';
import { getMappedBlogViewModel } from '../../helpers/map-to-blog-output';
import BlogModel from '../../models/Blog-model';
import {
  GetMappedBlogOutputModel,
  TBlogDb,
} from '../../models/GetBlogOutputModel';
import type { GetBlogsArgs } from '../../models/GetBlogsInputModel';
import type { GetPostsInBlogArgs } from '../../models/GetPostsInBlogArgs';
import type { IBlogsQueryRepository } from '../contracts/IBlogsQueryRepository';

type GetPostsInBlogQueryArgs = GetPostsInBlogArgs & {
  currentUserId?: string;
};

@injectable()
export class BlogsQueryRepository implements IBlogsQueryRepository {
  async getBlogs({
    searchNameTerm,
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
  }: GetBlogsArgs): Promise<PaginatedQueryResult<GetMappedBlogOutputModel>> {
    try {
      const filter = searchNameTerm
        ? { name: { $regex: searchNameTerm, $options: 'i' } }
        : {};
      const skipValue = calculateAndGetSkipValue({ pageNumber, pageSize });
      const items = await BlogModel.find(filter)
        .sort({ [sortBy]: sortDirection === SortDirections.desc ? -1 : 1 })
        .skip(skipValue)
        .limit(pageSize)
        .lean<TBlogDb[]>();
      const totalCount = await BlogModel.countDocuments(filter);
      return {
        items: items.map(getMappedBlogViewModel),
        totalCount,
      };
    } catch (error) {
      console.log(`BlogsQueryRepository get blogs error is occurred: ${error}`);
      return { items: [], totalCount: 0 };
    }
  }

  async getPostsInBlog({
    blogId,
    sortBy,
    sortDirection,
    pageNumber,
    pageSize,
    currentUserId,
  }: GetPostsInBlogQueryArgs): Promise<PaginatedQueryResult<GetMappedPostOutputModel> | null> {
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
      return {
        items: items.map((item) =>
          getMappedPostViewModel({ ...item, currentUserId }),
        ),
        totalCount,
      };
    } catch (error) {
      console.log(
        `BlogsQueryRepository.getPostsInBlog error is occurred: ${error}`,
      );
      return null;
    }
  }

  async findBlogById(id: string): Promise<GetMappedBlogOutputModel | null> {
    try {
      const foundBlog = await BlogModel.findOne({
        _id: new ObjectId(id),
      }).lean();
      return foundBlog ? getMappedBlogViewModel(foundBlog) : null;
    } catch (error) {
      console.log(
        `BlogsQueryRepository find blog by id error is occurred: ${error}`,
      );
      return null;
    }
  }
}
