import { ResourceType } from '@/core/types/resource-type';

import type { GetMappedBlogOutputModel } from '@/modules/blogs';
import type { GetMappedCommentOutputModel } from '@/modules/comments';
import type { GetMappedPostOutputModel } from '@/modules/posts';
import type { GetMappedUserOutputModel } from '@/modules/users';

type PaginatedMetaInput = {
  pageCount: number;
  totalCount: number;
  page?: number;
  pageSize?: number;
};

const buildMeta = ({
  pageCount,
  totalCount,
  page = 1,
  pageSize = 10,
}: PaginatedMetaInput) => ({
  page,
  pageSize,
  pageCount,
  totalCount,
});

export const toPostResource = (post: GetMappedPostOutputModel) => {
  const { id, ...attributes } = post;
  return { type: ResourceType.Posts, id, attributes };
};

export const toBlogResource = (blog: GetMappedBlogOutputModel) => {
  const { id, ...attributes } = blog;
  return { type: ResourceType.Blogs, id, attributes };
};

export const toUserResource = (user: GetMappedUserOutputModel) => {
  const { id, login, email, createdAt } = user;
  return {
    type: ResourceType.Users,
    id,
    attributes: { login, email, createdAt },
  };
};

export const toCommentResource = (comment: GetMappedCommentOutputModel) => {
  const { id, ...attributes } = comment;
  return { type: ResourceType.Comments, id, attributes };
};

export const paginatedPosts = (
  items: GetMappedPostOutputModel[],
  meta: PaginatedMetaInput,
) => ({
  meta: buildMeta(meta),
  data: items.map(toPostResource),
});

export const paginatedBlogs = (
  items: GetMappedBlogOutputModel[],
  meta: PaginatedMetaInput,
) => ({
  meta: buildMeta(meta),
  data: items.map(toBlogResource),
});

export const paginatedUsers = (
  items: GetMappedUserOutputModel[],
  meta: PaginatedMetaInput,
) => ({
  meta: buildMeta(meta),
  data: items.map(toUserResource),
});

export const paginatedComments = (
  items: GetMappedCommentOutputModel[],
  meta: PaginatedMetaInput,
) => ({
  meta: buildMeta(meta),
  data: items.map(toCommentResource),
});

export const singlePost = (post: GetMappedPostOutputModel) => ({
  data: toPostResource(post),
});

export const singleBlog = (blog: GetMappedBlogOutputModel) => ({
  data: toBlogResource(blog),
});

export const singleUser = (user: GetMappedUserOutputModel) => ({
  data: toUserResource(user),
});

export const singleComment = (comment: GetMappedCommentOutputModel) => ({
  data: toCommentResource(comment),
});

export const extractUserFromResponse = (body: {
  data: ReturnType<typeof toUserResource>;
}): GetMappedUserOutputModel => ({
  id: body.data.id,
  ...body.data.attributes,
});

export const extractPostFromResponse = (body: {
  data: ReturnType<typeof toPostResource>;
}): GetMappedPostOutputModel => ({
  id: body.data.id,
  ...body.data.attributes,
});

export const extractBlogFromResponse = (body: {
  data: ReturnType<typeof toBlogResource>;
}): GetMappedBlogOutputModel => ({
  id: body.data.id,
  ...body.data.attributes,
});

export const extractCommentFromResponse = (body: {
  data: ReturnType<typeof toCommentResource>;
}): GetMappedCommentOutputModel => ({
  id: body.data.id,
  ...body.data.attributes,
});
