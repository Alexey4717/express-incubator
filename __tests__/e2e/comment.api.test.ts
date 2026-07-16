import { setupE2eDb } from '@/../__tests__/e2e/e2e-db-lifecycle';
import { invalidInputData } from '@/../__tests__/e2e/post.api.test';
import { constants } from 'http2';
import { ObjectId } from 'mongodb';
import request from 'supertest';

import { getEncodedAuthToken } from '@/core/helpers';
import { LikeStatus } from '@/core/types/common';

import type { SigninInputModel } from '@/modules/auth';
import type {
  CreateBlogInputModel,
  GetMappedBlogOutputModel,
} from '@/modules/blogs';
import type { GetMappedCommentOutputModel } from '@/modules/comments';
import type {
  CreatePostInputModel,
  GetMappedPostOutputModel,
} from '@/modules/posts';
import type {
  CreateUserInputModel,
  GetMappedUserOutputModel,
} from '@/modules/users';

import { app } from '@/app/app';

describe('CRUD comments', () => {
  jest.setTimeout(1000 * 60);
  const encodedBase64Token = getEncodedAuthToken();
  const notExistingId = new ObjectId();

  const createUser = async (
    input: CreateUserInputModel = {
      login: 'login12',
      email: 'example@gmail.com',
      password: 'pass123',
    },
  ) => {
    const createResponse = await request(app)
      .post('/api/users')
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send(input)
      .expect(constants.HTTP_STATUS_CREATED);

    const createdUser: GetMappedUserOutputModel = createResponse?.body;
    return createdUser;
  };

  const auth = async (
    input: SigninInputModel = {
      loginOrEmail: 'example@gmail.com',
      password: 'pass123',
    },
  ) => {
    const { loginOrEmail, password } = input;
    const authData = await request(app)
      .post('/api/auth/login')
      .send({ loginOrEmail: loginOrEmail, password: password })
      .expect(constants.HTTP_STATUS_OK);

    return authData.body.accessToken;
  };

  const createBlog = async (
    input: CreateBlogInputModel | undefined = {
      name: 'blog1',
      description: 'about blog1',
      websiteUrl: 'https://google.com',
    },
  ) => {
    const createResponse = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send(input)
      .expect(constants.HTTP_STATUS_CREATED);

    const createdBlog: GetMappedBlogOutputModel = createResponse?.body;
    return createdBlog;
  };

  const getCreatedBlogId = async () => {
    const result = await createBlog();
    const createdBlogId = result.id;
    return createdBlogId;
  };

  const createPost = async (
    blogId: string,
    input?: Omit<CreatePostInputModel, 'blogId'>,
  ) => {
    const defaultPayload = {
      title: 'title',
      content: 'content',
      shortDescription: 'shortDescription',
      ...input,
    };

    const createResponse = await request(app)
      .post('/api/posts')
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send({ ...defaultPayload, blogId })
      .expect(constants.HTTP_STATUS_CREATED);

    const createdPost: GetMappedPostOutputModel = createResponse?.body;
    return createdPost;
  };

  const createCommentInPost = async ({
    postId,
    content,
  }: {
    postId: string;
    content: string;
  }) => {
    const result = await request(app)
      .post(`/api/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content })
      .expect(constants.HTTP_STATUS_CREATED);
    return result.body;
  };

  let createdUser: GetMappedUserOutputModel;
  let createdUser2: GetMappedUserOutputModel;
  let accessToken: string;
  let otherUserAccessToken: string;
  let createdBlogId: string;
  let createdPost: GetMappedPostOutputModel;
  let createdComment: GetMappedCommentOutputModel;

  setupE2eDb(60000);

  beforeAll(async () => {
    await request(app)
      .delete('/api/testing/all-data')
      .expect(constants.HTTP_STATUS_NO_CONTENT);

    createdUser = await createUser({
      password: 'password1',
      email: 'email1@mail.ru',
      login: 'login1',
    });
    createdUser2 = await createUser({
      password: 'password12',
      email: 'email2@mail.ru',
      login: 'gggggg',
    });
    accessToken = await auth({
      loginOrEmail: 'login1',
      password: 'password1',
    });
    otherUserAccessToken = await auth({
      loginOrEmail: 'gggggg',
      password: 'password12',
    });
    createdBlogId = await getCreatedBlogId();
    createdPost = await createPost(createdBlogId);
    createdComment = await createCommentInPost({
      postId: createdPost.id,
      content: 'Hello world, it`s my first comment!',
    });
  });

  // testing get '/comments/:commentId' api
  it(`should return 404 if comment not exist`, async () => {
    await request(app)
      .get(`/api/comments/${notExistingId}/`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(constants.HTTP_STATUS_NOT_FOUND);
  });
  it(`should return 200 if comment exist`, async () => {
    await request(app)
      .get(`/api/comments/${createdComment.id}/`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(constants.HTTP_STATUS_OK);
  });
  it(`should return 200 and correct likes count`, async () => {
    const result = await request(app)
      .get(`/api/comments/${createdComment.id}/`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(result.status).toBe(constants.HTTP_STATUS_OK);

    await request(app)
      .put(`/api/comments/${createdComment.id}/like-status`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ likeStatus: LikeStatus.Like })
      .expect(constants.HTTP_STATUS_NO_CONTENT);

    const commentAfterLike = await request(app)
      .get(`/api/comments/${createdComment.id}/`)
      .auth(accessToken, { type: 'bearer' });

    expect(commentAfterLike.status).toBe(constants.HTTP_STATUS_OK);
    expect(commentAfterLike.body.likesInfo.likesCount).toBe(1);
    expect(commentAfterLike.body.likesInfo.myStatus).toBe(LikeStatus.Like);
  });

  // testing put '/comments/:commentId' api
  it(`should return 401 if not auth`, async () => {
    await request(app)
      .put(`/api/comments/${createdComment.id}/`)
      .send({ content: 'Hello world, it`s my second comment!' })
      .expect(constants.HTTP_STATUS_UNAUTHORIZED);
  });
  it(`should return 404 if comment not exist`, async () => {
    await request(app)
      .put(`/api/comments/${notExistingId}/`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Hello world, it`s my second comment!' })
      .expect(constants.HTTP_STATUS_NOT_FOUND);
  });
  it(`should return 403 if comment not own user`, async () => {
    await request(app)
      .put(`/api/comments/${createdComment.id}/`)
      .set('Authorization', `Bearer ${otherUserAccessToken}`)
      .send({ content: 'Hello world, it`s my second comment!' })
      .expect(constants.HTTP_STATUS_FORBIDDEN);
  });
  it(`should return 204 if correct input data`, async () => {
    await request(app)
      .put(`/api/comments/${createdComment.id}/`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'Hello world, it`s my other comment!' })
      .expect(constants.HTTP_STATUS_NO_CONTENT);
  });
  it(`should return 400 if incorrect input data`, async () => {
    await request(app)
      .put(`/api/comments/${createdComment.id}/`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(invalidInputData.comment1)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/comments/${createdComment.id}/`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(invalidInputData.comment2)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/comments/${createdComment.id}/`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(invalidInputData.comment3)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/comments/${createdComment.id}/`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(invalidInputData.comment4)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/comments/${createdComment.id}/`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(invalidInputData.comment5)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/comments/${createdComment.id}/`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(invalidInputData.comment6)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);
  });

  // testing delete '/comments/:commentId' api
  it(`should return 401 if not auth`, async () => {
    await request(app)
      .delete(`/api/comments/${createdComment.id}/`)
      .expect(constants.HTTP_STATUS_UNAUTHORIZED);
  });
  it(`should return 404 if comment not exist`, async () => {
    await request(app)
      .delete(`/api/comments/${notExistingId}/`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(constants.HTTP_STATUS_NOT_FOUND);
  });
  it(`should return 403 if comment not own user`, async () => {
    await request(app)
      .delete(`/api/comments/${createdComment.id}/`)
      .set('Authorization', `Bearer ${otherUserAccessToken}`)
      .expect(constants.HTTP_STATUS_FORBIDDEN);
  });
  it(`should return 204 if comment exist`, async () => {
    await request(app)
      .delete(`/api/comments/${createdComment.id}/`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(constants.HTTP_STATUS_NO_CONTENT);
  });
});
