import { constants } from 'http2';
import { ObjectId } from 'mongodb';
import request from 'supertest';

import { getEncodedAuthToken } from '@/core/helpers';

import type {
  CreateBlogInputModel,
  GetMappedBlogOutputModel,
} from '@/modules/blogs';
import type {
  CreatePostInputModel,
  GetMappedPostOutputModel,
} from '@/modules/posts';

import { app } from '@/app/app';

import { setupE2eDb } from './e2e-db-lifecycle';
import {
  extractBlogFromResponse,
  extractPostFromResponse,
  paginatedBlogs,
  paginatedPosts,
  paginatedUsers,
  singleBlog,
} from './json-api.helpers';
import { invalidInputData as invalidPostInputData } from './post.api.test';

describe('/blog', () => {
  setupE2eDb();

  beforeEach(async () => {
    await request(app)
      .delete('/api/testing/all-data')
      .expect(constants.HTTP_STATUS_NO_CONTENT);
  });

  const notExistingId = new ObjectId(); // valid format
  const encodedBase64Token = getEncodedAuthToken();

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

    const createdBlog: GetMappedBlogOutputModel = extractBlogFromResponse(
      createResponse.body,
    );
    return createdBlog;
  };

  const invalidInputData = {
    name1: { description: 'description', websiteUrl: 'https://google.com' },
    name2: {
      name: '',
      description: 'description',
      websiteUrl: 'https://google.com',
    },
    name3: {
      name: '   ',
      description: 'description',
      websiteUrl: 'https://google.com',
    },
    name4: {
      name: 'qwertyuiopasdfgh',
      description: 'description',
      websiteUrl: 'https://google.com',
    },
    name5: {
      name: 1,
      description: 'description',
      websiteUrl: 'https://google.com',
    },
    name6: {
      name: false,
      description: 'description',
      websiteUrl: 'https://google.com',
    },

    description1: { name: 'name', websiteUrl: 'https://google.com' },
    description2: {
      name: 'name',
      description: '',
      websiteUrl: 'https://google.com',
    },
    description3: {
      name: 'name',
      description: '   ',
      websiteUrl: 'https://google.com',
    },
    description4: {
      name: 'name',
      description: new Array(502).join('a'),
      websiteUrl: 'https://google.com',
    },
    description5: {
      name: 'name',
      description: 1,
      websiteUrl: 'https://google.com',
    },
    description6: {
      name: 'name',
      description: false,
      websiteUrl: 'https://google.com',
    },

    websiteUrl1: { name: 'name', description: 'description' },
    websiteUrl2: { name: 'name', description: 'description', websiteUrl: '' },
    websiteUrl3: {
      name: 'name',
      description: 'description',
      websiteUrl: '   ',
    },
    websiteUrl4: {
      name: 'name',
      description: 'description',
      websiteUrl: new Array(102).join('a'),
    },
    websiteUrl5: { name: 'name', description: 'description', websiteUrl: 1 },
    websiteUrl6: {
      name: 'name',
      description: 'description',
      websiteUrl: false,
    },
    websiteUrl7: {
      name: 'name',
      description: 'description',
      websiteUrl: 'not url string',
    },
  };

  // testing get '/api/blogs' api
  it('should return 200 and empty array', async () => {
    await request(app)
      .get('/api/blogs')
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedBlogs([], { pageCount: 0, totalCount: 0 }),
      );
  });
  it('should return 200 and array of blogs', async () => {
    const input1: CreateBlogInputModel = {
      name: 'blog1',
      description: 'about blog1',
      websiteUrl: 'https://google.com',
    };
    const createdBlog1 = await createBlog(input1);

    await request(app)
      .get('/api/blogs')
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedBlogs([createdBlog1], {
          pageCount: 1,
          totalCount: 1,
          page: 1,
          pageSize: 10,
        }),
      );

    const input2: CreateBlogInputModel = {
      name: 'blog2',
      description: 'about blog2',
      websiteUrl: 'https://yandex.ru',
    };

    const createdBlog2 = await createBlog(input2);

    await request(app)
      .get('/api/blogs')
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedBlogs([createdBlog2, createdBlog1], {
          pageCount: 1,
          totalCount: 2,
          page: 1,
          pageSize: 10,
        }),
      );
  });
  it('should return 200 and array of blogs by searchNameTerm=va query', async () => {
    const input1: CreateBlogInputModel = {
      name: 'Ivan',
      description: 'about blog1',
      websiteUrl: 'https://google.com',
    };
    const createdBlog1 = await createBlog(input1);

    const input2: CreateBlogInputModel = {
      name: 'DiVan',
      description: 'about blog2',
      websiteUrl: 'https://yandex.ru',
    };

    const createdBlog2 = await createBlog(input2);

    const input3: CreateBlogInputModel = {
      name: 'Gggg',
      description: 'about blog3',
      websiteUrl: 'https://yandex.ru',
    };

    const createdBlog3 = await createBlog(input3);

    const input4: CreateBlogInputModel = {
      name: 'JanClod Vandam',
      description: 'about blog4',
      websiteUrl: 'https://yandex.ru',
    };

    const createdBlog4 = await createBlog(input4);

    await request(app)
      .get('/api/blogs?searchNameTerm=va')
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedBlogs([createdBlog4, createdBlog2, createdBlog1], {
          pageCount: 1,
          totalCount: 3,
          page: 1,
          pageSize: 10,
        }),
      );
  });
  it('should return 200 and array of blogs sorted by specified field with sortDirection', async () => {
    const input1: CreateBlogInputModel = {
      name: 'Alex',
      description: 'Align items',
      websiteUrl: 'https://google.com',
    };
    const createdBlog1 = await createBlog(input1);

    const input2: CreateBlogInputModel = {
      name: 'John',
      description: 'About flowers',
      websiteUrl: 'https://yandex.ru',
    };

    const createdBlog2 = await createBlog(input2);

    const input3: CreateBlogInputModel = {
      name: 'Zed',
      description: 'ChatGPT',
      websiteUrl: 'https://yandex.ru',
    };

    const createdBlog3 = await createBlog(input3);

    const input4: CreateBlogInputModel = {
      name: 'Ben',
      description: 'Building',
      websiteUrl: 'https://yandex.ru',
    };

    const createdBlog4 = await createBlog(input4);

    await request(app)
      .get('/api/blogs?sortBy=name')
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedBlogs(
          [createdBlog3, createdBlog2, createdBlog4, createdBlog1],
          { pageCount: 1, totalCount: 4, page: 1, pageSize: 10 },
        ),
      );

    await request(app)
      .get('/api/blogs?sortBy=description&sortDirection=asc')
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedBlogs(
          [createdBlog2, createdBlog1, createdBlog4, createdBlog3],
          { pageCount: 1, totalCount: 4, page: 1, pageSize: 10 },
        ),
      );
  });
  it('should return 200 and portion array of blogs with page number and size', async () => {
    const input1: CreateBlogInputModel = {
      name: 'Alex',
      description: 'Align items',
      websiteUrl: 'https://google.com',
    };
    const createdBlog1 = await createBlog(input1);

    const input2: CreateBlogInputModel = {
      name: 'John',
      description: 'About flowers',
      websiteUrl: 'https://yandex.ru',
    };
    const createdBlog2 = await createBlog(input2);

    const input3: CreateBlogInputModel = {
      name: 'Zed',
      description: 'ChatGPT',
      websiteUrl: 'https://yandex.ru',
    };
    const createdBlog3 = await createBlog(input3);

    const input4: CreateBlogInputModel = {
      name: 'Ben',
      description: 'Building',
      websiteUrl: 'https://yandex.ru',
    };
    const createdBlog4 = await createBlog(input4);

    const input5: CreateBlogInputModel = {
      name: 'Ben',
      description: 'Building',
      websiteUrl: 'https://yandex.ru',
    };
    const createdBlog5 = await createBlog(input5);

    const input6: CreateBlogInputModel = {
      name: 'Ben',
      description: 'Building',
      websiteUrl: 'https://yandex.ru',
    };
    const createdBlog6 = await createBlog(input6);

    await request(app)
      .get('/api/blogs')
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedBlogs(
          [
            createdBlog6,
            createdBlog5,
            createdBlog4,
            createdBlog3,
            createdBlog2,
            createdBlog1,
          ],
          { pageCount: 1, totalCount: 6, page: 1, pageSize: 10 },
        ),
      );

    await request(app)
      .get('/api/blogs?pageSize=4')
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedBlogs(
          [createdBlog6, createdBlog5, createdBlog4, createdBlog3],
          { pageCount: 2, totalCount: 6, page: 1, pageSize: 4 },
        ),
      );

    await request(app)
      .get('/api/blogs?pageNumber=2&pageSize=2')
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedBlogs([createdBlog4, createdBlog3], {
          pageCount: 3,
          totalCount: 6,
          page: 2,
          pageSize: 2,
        }),
      );
  });

  // testing get '/api/blogs/:id' api
  it('should return 404 for not existing blog', async () => {
    await request(app)
      .get(`/api/blogs/${notExistingId}`)
      .expect(constants.HTTP_STATUS_NOT_FOUND);
  });
  it('should return 200 and existing blog', async () => {
    const createdBlog = await createBlog();

    await request(app)
      .get(`/api/blogs/${createdBlog.id}`)
      .expect(constants.HTTP_STATUS_OK, singleBlog(createdBlog));
  });

  // testing delete '/api/blogs/:id' api
  it('should return 401 for not auth user', async () => {
    await request(app)
      .delete(`/api/blogs/${notExistingId}`)
      .expect(constants.HTTP_STATUS_UNAUTHORIZED);
  });
  it('should return 404 for not existing blog', async () => {
    await request(app)
      .delete(`/api/blogs/${notExistingId}`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .expect(constants.HTTP_STATUS_NOT_FOUND);
  });
  it('should return 204 for existing blog', async () => {
    const createdBlog = await createBlog();
    await request(app)
      .delete(`/api/blogs/${createdBlog.id}`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .expect(constants.HTTP_STATUS_NO_CONTENT);
  });

  // testing post '/api/blogs' api
  it(`shouldn't create blog if not auth user`, async () => {
    const input: CreateBlogInputModel = {
      name: 'blog1',
      description: 'about blog1',
      websiteUrl: 'https://google.com',
    };
    await request(app)
      .post('/api/blogs')
      .send(input)
      .expect(constants.HTTP_STATUS_UNAUTHORIZED);

    await request(app)
      .get('/api/blogs')
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedBlogs([], { pageCount: 0, totalCount: 0 }),
      );
  });
  it(`shouldn't create blog with incorrect input data`, async () => {
    await request(app)
      .post('/api/blogs')
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send(invalidInputData.name1)
      .send(invalidInputData.name2)
      .send(invalidInputData.name3)
      .send(invalidInputData.name4)
      .send(invalidInputData.name5)
      .send(invalidInputData.name6)
      .send(invalidInputData.description1)
      .send(invalidInputData.description2)
      .send(invalidInputData.description3)
      .send(invalidInputData.description4)
      .send(invalidInputData.description5)
      .send(invalidInputData.description6)
      .send(invalidInputData.websiteUrl1)
      .send(invalidInputData.websiteUrl2)
      .send(invalidInputData.websiteUrl3)
      .send(invalidInputData.websiteUrl4)
      .send(invalidInputData.websiteUrl5)
      .send(invalidInputData.websiteUrl6)
      .send(invalidInputData.websiteUrl7)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .get('/api/blogs')
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedBlogs([], { pageCount: 0, totalCount: 0 }),
      );
  });
  it(`should create blog with correct input data`, async () => {
    const input: CreateBlogInputModel = {
      name: 'blog1',
      description: 'about blog1',
      websiteUrl: 'https://google.com',
    };
    const createResponse = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send(input)
      .expect(constants.HTTP_STATUS_CREATED);

    const createdBlog: GetMappedBlogOutputModel = extractBlogFromResponse(
      createResponse.body,
    );
    const expectedBlog = {
      ...input,
      createdAt: createdBlog.createdAt,
      id: createdBlog.id,
      name: createdBlog.name,
      description: createdBlog.description,
      isMembership: createdBlog.isMembership,
      websiteUrl: createdBlog.websiteUrl,
    } as GetMappedBlogOutputModel;

    expect(createdBlog).toEqual(expectedBlog);

    await request(app)
      .get('/api/blogs')
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedBlogs([createdBlog], {
          pageCount: 1,
          totalCount: 1,
          page: 1,
          pageSize: 10,
        }),
      );
  });

  // testing get '/api/blogs/{blogId}/posts' api
  it('should return 404 for not existing post in blog', async () => {
    await request(app)
      .get(`/api/blogs/${notExistingId}/posts`)
      .expect(constants.HTTP_STATUS_NOT_FOUND);
  });

  // testing post '/api/blogs/{blogId}/posts' api
  it(`shouldn't create post in blog if not auth user`, async () => {
    const createdBlog = await createBlog();
    const input: CreateBlogInputModel = {
      name: 'blog3',
      description: 'about blog1',
      websiteUrl: 'https://google.com',
    };

    await request(app)
      .get('/api/blogs')
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedBlogs([createdBlog], {
          pageCount: 1,
          totalCount: 1,
          page: 1,
          pageSize: 10,
        }),
      );

    const input2: CreatePostInputModel = {
      title: 'title',
      blogId: createdBlog?.id,
      content: 'content',
      shortDescription: 'shortDescription',
    };
    await request(app)
      .post(`/api/blogs/${createdBlog?.id}/posts`)
      .send(input2)
      .expect(constants.HTTP_STATUS_UNAUTHORIZED);
  });
  it(`shouldn't create post in blog if not auth user`, async () => {
    const createdBlog = await createBlog();
    const createdBlogId = createdBlog?.id;
    const input: CreateBlogInputModel = {
      name: 'blog3',
      description: 'about blog1',
      websiteUrl: 'https://google.com',
    };

    await request(app)
      .get('/api/blogs')
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedBlogs([createdBlog], {
          pageCount: 1,
          totalCount: 1,
          page: 1,
          pageSize: 10,
        }),
      );

    const { blogId: blogId1, ...invalidPostInputDataInvalidTitle1 } =
      invalidPostInputData.title1;
    await request(app)
      .post(`/api/blogs/${createdBlogId}/posts`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send({ ...invalidPostInputDataInvalidTitle1 })
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    const { blogId: blogId2, ...invalidPostInputDataInvalidTitle2 } =
      invalidPostInputData.title2;
    await request(app)
      .post(`/api/blogs/${createdBlogId}/posts`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send({ ...invalidPostInputDataInvalidTitle2 })
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    const { blogId: blogId3, ...invalidPostInputDataInvalidTitle3 } =
      invalidPostInputData.title3;
    await request(app)
      .post(`/api/blogs/${createdBlogId}/posts`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send({ ...invalidPostInputDataInvalidTitle3 })
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    const { blogId: blogId4, ...invalidPostInputDataInvalidTitle4 } =
      invalidPostInputData.title4;
    await request(app)
      .post(`/api/blogs/${createdBlogId}/posts`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send({ ...invalidPostInputDataInvalidTitle4 })
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    const { blogId: blogId5, ...invalidPostInputDataInvalidTitle5 } =
      invalidPostInputData.title5;
    await request(app)
      .post(`/api/blogs/${createdBlogId}/posts`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send({ ...invalidPostInputDataInvalidTitle5 })
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    const { blogId: blogId6, ...invalidPostInputDataInvalidTitle6 } =
      invalidPostInputData.title6;
    await request(app)
      .post(`/api/blogs/${createdBlogId}/posts`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send({ ...invalidPostInputDataInvalidTitle6 })
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    const { blogId: blogId7, ...invalidShortDescription1PostInputData } =
      invalidPostInputData.shortDescription1;
    await request(app)
      .post(`/api/blogs/${createdBlogId}/posts`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send({ ...invalidShortDescription1PostInputData })
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    const { blogId: blogId8, ...invalidShortDescription2PostInputData } =
      invalidPostInputData.shortDescription2;
    await request(app)
      .post(`/api/blogs/${createdBlogId}/posts`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send({ ...invalidShortDescription2PostInputData })
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    const { blogId: blogId9, ...invalidShortDescription3PostInputData } =
      invalidPostInputData.shortDescription3;
    await request(app)
      .post(`/api/blogs/${createdBlogId}/posts`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send({ ...invalidShortDescription3PostInputData })
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    const { blogId: blogId10, ...invalidShortDescription4PostInputData } =
      invalidPostInputData.shortDescription4;
    await request(app)
      .post(`/api/blogs/${createdBlogId}/posts`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send({ ...invalidShortDescription4PostInputData })
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    const { blogId: blogId11, ...invalidShortDescription5PostInputData } =
      invalidPostInputData.shortDescription5;
    await request(app)
      .post(`/api/blogs/${createdBlogId}/posts`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send({ ...invalidShortDescription5PostInputData })
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    const { blogId: blogId12, ...invalidShortDescription6PostInputData } =
      invalidPostInputData.shortDescription6;
    await request(app)
      .post(`/api/blogs/${createdBlogId}/posts`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send({ ...invalidShortDescription6PostInputData })
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    const { blogId: blogId13, ...invalidContent1PostInputData } =
      invalidPostInputData.content1;
    await request(app)
      .post(`/api/blogs/${createdBlogId}/posts`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send({ ...invalidContent1PostInputData })
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    const { blogId: blogId14, ...invalidContent2PostInputData } =
      invalidPostInputData.content2;
    await request(app)
      .post(`/api/blogs/${createdBlogId}/posts`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send({ ...invalidContent2PostInputData })
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    const { blogId: blogId15, ...invalidContent3PostInputData } =
      invalidPostInputData.content3;
    await request(app)
      .post(`/api/blogs/${createdBlogId}/posts`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send({ ...invalidContent3PostInputData })
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    const { blogId: blogId16, ...invalidContent4PostInputData } =
      invalidPostInputData.content4;
    await request(app)
      .post(`/api/blogs/${createdBlogId}/posts`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send({ ...invalidContent4PostInputData })
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    const { blogId: blogId17, ...invalidContent5PostInputData } =
      invalidPostInputData.content5;
    await request(app)
      .post(`/api/blogs/${createdBlogId}/posts`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send({ ...invalidContent5PostInputData })
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    const { blogId: blogId18, ...invalidContent6PostInputData } =
      invalidPostInputData.content6;
    await request(app)
      .post(`/api/blogs/${createdBlogId}/posts`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send({ ...invalidContent6PostInputData })
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .get(`/api/blogs/${createdBlogId}/posts`)
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedUsers([], { pageCount: 0, totalCount: 0 }),
      );
  });
  it(`should create post in blog with correct input data`, async () => {
    const createdBlog = await createBlog();
    const createdBlogId = createdBlog?.id;
    const input: CreateBlogInputModel = {
      name: 'blog3',
      description: 'about blog1',
      websiteUrl: 'https://google.com',
    };

    await request(app)
      .get('/api/blogs')
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedBlogs([createdBlog], {
          pageCount: 1,
          totalCount: 1,
          page: 1,
          pageSize: 10,
        }),
      );

    const input2 = {
      title: 'title',
      content: 'content',
      shortDescription: 'shortDescription',
    };

    const createResponse = await request(app)
      .post(`/api/blogs/${createdBlogId}/posts`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send(input2)
      .expect(constants.HTTP_STATUS_CREATED);

    const createdPost: GetMappedPostOutputModel = extractPostFromResponse(
      createResponse.body,
    );
    const expectedPost: GetMappedPostOutputModel = {
      ...input2,
      id: createdPost.id,
      title: createdPost.title,
      blogId: createdPost.blogId,
      content: createdPost.content,
      shortDescription: createdPost.shortDescription,
      blogName: createdPost.blogName,
      createdAt: createdPost.createdAt,
      extendedLikesInfo: createdPost.extendedLikesInfo,
    };

    expect(createdPost).toEqual(expectedPost);

    await request(app)
      .get(`/api/blogs/${createdBlogId}/posts`)
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedPosts([createdPost], {
          pageCount: 1,
          totalCount: 1,
          page: 1,
          pageSize: 10,
        }),
      );
  });

  // testing put '/api/blogs/:id' api
  it(`shouldn't update blog if not auth user`, async () => {
    const createdBlog = await createBlog();
    const input: CreateBlogInputModel = {
      name: 'blog3',
      description: 'about blog1',
      websiteUrl: 'https://google.com',
    };
    await request(app)
      .put(`/api/blogs/${createdBlog?.id}`)
      .send(input)
      .expect(constants.HTTP_STATUS_UNAUTHORIZED);

    await request(app)
      .get('/api/blogs')
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedBlogs([createdBlog], {
          pageCount: 1,
          totalCount: 1,
          page: 1,
          pageSize: 10,
        }),
      );
  });
  it(`shouldn't update blog with incorrect input data`, async () => {
    const createdBlog = await createBlog();
    await request(app)
      .put(`/api/blogs/${createdBlog?.id}`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send(invalidInputData.name1)
      .send(invalidInputData.name2)
      .send(invalidInputData.name3)
      .send(invalidInputData.name4)
      .send(invalidInputData.name5)
      .send(invalidInputData.name6)
      .send(invalidInputData.description1)
      .send(invalidInputData.description2)
      .send(invalidInputData.description3)
      .send(invalidInputData.description4)
      .send(invalidInputData.description5)
      .send(invalidInputData.description6)
      .send(invalidInputData.websiteUrl1)
      .send(invalidInputData.websiteUrl2)
      .send(invalidInputData.websiteUrl3)
      .send(invalidInputData.websiteUrl4)
      .send(invalidInputData.websiteUrl5)
      .send(invalidInputData.websiteUrl6)
      .send(invalidInputData.websiteUrl7)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .get('/api/blogs')
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedBlogs([createdBlog], {
          pageCount: 1,
          totalCount: 1,
          page: 1,
          pageSize: 10,
        }),
      );
  });
  it(`shouldn't update blog if not exist`, async () => {
    const input: CreateBlogInputModel = {
      name: 'blog3',
      description: 'about blog1',
      websiteUrl: 'https://google.com',
    };
    await request(app)
      .put(`/api/blogs/${notExistingId}`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send(input)
      .expect(constants.HTTP_STATUS_NOT_FOUND);

    await request(app)
      .get('/api/blogs')
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedBlogs([], { pageCount: 0, totalCount: 0 }),
      );
  });
  it(`should update blog with correct input data`, async () => {
    const dataForCreate: CreateBlogInputModel = {
      name: 'blog1',
      description: 'about blog1',
      websiteUrl: 'https://google.com',
    };
    const createdBlog = await createBlog(dataForCreate);

    await request(app)
      .get('/api/blogs')
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedBlogs([createdBlog], {
          pageCount: 1,
          totalCount: 1,
          page: 1,
          pageSize: 10,
        }),
      );

    const dataForUpdate: CreateBlogInputModel = {
      name: 'blog3',
      description: 'about blog3',
      websiteUrl: 'https://yandex.ru',
    };

    await request(app)
      .put(`/api/blogs/${createdBlog?.id}`)
      .set('Authorization', `Basic ${encodedBase64Token}`)
      .send(dataForUpdate)
      .expect(constants.HTTP_STATUS_NO_CONTENT);

    const updatedBlog = { ...createdBlog, ...dataForUpdate };

    await request(app)
      .get('/api/blogs')
      .expect(
        constants.HTTP_STATUS_OK,
        paginatedBlogs([updatedBlog], {
          pageCount: 1,
          totalCount: 1,
          page: 1,
          pageSize: 10,
        }),
      );
  });
});
