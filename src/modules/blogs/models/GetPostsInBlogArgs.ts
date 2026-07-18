import type { GetPostsArgs } from '@/modules/posts';

export type GetPostsInBlogArgs = GetPostsArgs & {
  blogId: string;
};
