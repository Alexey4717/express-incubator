import request from "supertest";
import {MongoMemoryServer} from "mongodb-memory-server";
import {ObjectId} from 'mongodb';
import {constants} from "http2";

import {app} from "../../index";
import {CreatePostInputModel} from '../../models/PostModels/CreatePostInputModel';
import {getEncodedAuthToken} from "../../helpers";
import {GetMappedPostOutputModel, NewestLikeType} from "../../models/PostModels/GetPostOutputModel";
import {CreateBlogInputModel} from "../../models/BlogModels/CreateBlogInputModel";
import {GetMappedBlogOutputModel} from "../../models/BlogModels/GetBlogOutputModel";
import {CreateUserInputModel} from "../../models/UserModels/CreateUserInputModel";
import {GetMappedUserOutputModel} from "../../models/UserModels/GetUserOutputModel";
import {SigninInputModel} from "../../models/AuthModels/SigninInputModel";
import {LikeStatus} from "../../types/common";


const mockedcreatedBlogId = new ObjectId().toString();

export const invalidInputData = {
    title1: {shortDescription: 'shortDescription', content: 'content', blogId: mockedcreatedBlogId},
    title2: {title: '', shortDescription: 'shortDescription', content: 'content', blogId: mockedcreatedBlogId},
    title3: {title: '   ', shortDescription: 'shortDescription', content: 'content', blogId: mockedcreatedBlogId},
    title4: {
        title: new Array(32).join("a"),
        shortDescription: 'shortDescription',
        content: 'content',
        blogId: mockedcreatedBlogId
    },
    title5: {title: 1, shortDescription: 'shortDescription', content: 'content', blogId: mockedcreatedBlogId},
    title6: {title: false, shortDescription: 'shortDescription', content: 'content', blogId: mockedcreatedBlogId},

    shortDescription1: {title: 'title', content: 'content', blogId: mockedcreatedBlogId},
    shortDescription2: {title: 'title', shortDescription: '', content: 'content', blogId: mockedcreatedBlogId},
    shortDescription3: {title: 'title', shortDescription: '   ', content: 'content', blogId: mockedcreatedBlogId},
    shortDescription4: {
        title: 'title',
        shortDescription: new Array(102).join("a"),
        content: 'content',
        blogId: mockedcreatedBlogId
    },
    shortDescription5: {title: 'title', shortDescription: 1, content: 'content', blogId: mockedcreatedBlogId},
    shortDescription6: {title: 'title', shortDescription: false, content: 'content', blogId: mockedcreatedBlogId},

    content1: {title: 'title', shortDescription: 'shortDescription', blogId: mockedcreatedBlogId},
    content2: {title: 'title', shortDescription: 'shortDescription', content: '', blogId: mockedcreatedBlogId},
    content3: {title: 'title', shortDescription: 'shortDescription', content: '   ', blogId: mockedcreatedBlogId},
    content4: {
        title: 'title',
        shortDescription: 'shortDescription',
        content: new Array(1002).join("a"),
        blogId: mockedcreatedBlogId
    },
    content5: {title: 'title', shortDescription: 'shortDescription', content: 1, blogId: mockedcreatedBlogId},
    content6: {title: 'title', shortDescription: 'shortDescription', content: false, blogId: mockedcreatedBlogId},

    blogId1: {title: 'title', shortDescription: 'shortDescription', content: 'content'},
    blogId2: {title: 'title', shortDescription: 'shortDescription', content: 'content', blogId: ''},
    blogId3: {title: 'title', shortDescription: 'shortDescription', content: 'content', blogId: '   '},
    blogId4: {title: 'title', shortDescription: 'shortDescription', content: 'content', blogId: 123},
    blogId5: {title: 'title', shortDescription: 'shortDescription', content: 'content', blogId: false},
    blogId6: {
        title: 'title',
        shortDescription: 'shortDescription',
        content: 'content',
        blogId: '63cde53de1eeeb34059bda94'
    }, // not exists blog

    // for testing comments
    comment1: {},
    comment2: {content: ''},
    comment3: {content: ' '},
    comment4: {content: true},
    comment5: {content: new Array(20).join("a")},
    comment6: {content: new Array(302).join("a")},
}

describe('/post', () => {
    const encodedBase64Token = getEncodedAuthToken();
    const notExistingId = new ObjectId();

    const createUser = async (input: CreateUserInputModel = {
        login: 'login12',
        email: 'example@gmail.com',
        password: 'pass123',
    }) => {
        const createResponse = await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(input)
            .expect(constants.HTTP_STATUS_CREATED)

        const createdUser: GetMappedUserOutputModel = createResponse?.body;
        return createdUser;
    };

    const auth = async (input: SigninInputModel = {
        loginOrEmail: 'example@gmail.com',
        password: 'pass123'
    }) => {
        const {loginOrEmail, password} = input;
        const authData = await request(app)
            .post('/auth/login')
            .send({loginOrEmail, password})
            .expect(constants.HTTP_STATUS_OK)

        return authData.body.accessToken;
    }

    const createBlog = async (input: CreateBlogInputModel | undefined = {
        name: 'blog1',
        description: 'about blog1',
        websiteUrl: 'https://google.com'
    }) => {
        const createResponse = await request(app)
            .post('/blogs')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(input)
            .expect(constants.HTTP_STATUS_CREATED)

        const createdBlog: GetMappedBlogOutputModel = createResponse?.body;
        return createdBlog;
    }

    const getCreatedBlogId = async () => {
        const result = await createBlog();
        const createdBlogId = result.id;
        return createdBlogId;
    };

    const createPost = async (blogId: string, input?: Omit<CreatePostInputModel, 'blogId'>) => {
        const defaultPayload = {
            title: 'title',
            content: 'content',
            shortDescription: 'shortDescription',
            ...input
        }

        const createResponse = await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...defaultPayload, blogId})
            .expect(constants.HTTP_STATUS_CREATED)

        const createdPost: GetMappedPostOutputModel = createResponse?.body;
        return createdPost;
    }

    const createPostInBlog = async (blogId: string, input?: Omit<CreatePostInputModel, 'blogId'>) => {
        const defaultPayload = {
            title: 'title',
            content: 'content',
            shortDescription: 'shortDescription',
            ...input
        }

        const createResponse = await request(app)
            .post(`/blogs/${blogId}/posts`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...defaultPayload})
            .expect(constants.HTTP_STATUS_CREATED)

        const createdPost: GetMappedPostOutputModel = createResponse?.body;
        return createdPost;
    }

    let mongoMemoryServer: MongoMemoryServer

    beforeAll(async () => {
        mongoMemoryServer = await MongoMemoryServer.create()
        const mongoUri = mongoMemoryServer.getUri()
        process.env['MONGO_URI'] = mongoUri
    })

    beforeEach(async () => {
        await request(app)
            .delete('/testing/all-data')
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        await createBlog();
    })

    // testing get '/posts' api
    it('should return 200 and empty array', async () => {
        await request(app)
            .get('/posts')
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            })
    })
    it('should return 200 and array of posts', async () => {
        const createdBlogId = await getCreatedBlogId();
        const input1: CreatePostInputModel = {
            title: 'title',
            blogId: createdBlogId,
            content: 'content',
            shortDescription: 'shortDescription'
        };
        const createdPost1 = await createPost(createdBlogId);

        await request(app)
            .get('/posts')
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [createdPost1]
            });

        const input2: CreatePostInputModel = {
            title: 'title2',
            blogId: createdBlogId,
            content: 'content2',
            shortDescription: 'shortDescription2'
        };

        const createdPost2 = await createPost(createdBlogId);

        await request(app)
            .get('/posts')
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [createdPost2, createdPost1]
            });
    })
    it('should return 200 and array of blogs sorted by specified field with sortDirection', async () => {
        const createdBlogId = await getCreatedBlogId();

        const input1: CreatePostInputModel = {
            title: 'Alex',
            blogId: createdBlogId,
            content: 'content',
            shortDescription: 'Align items'
        };
        const createdPost1 = await createPost(createdBlogId, input1);

        const input2: CreatePostInputModel = {
            title: 'John',
            blogId: createdBlogId,
            content: 'content',
            shortDescription: 'About flowers'
        };
        const createdPost2 = await createPost(createdBlogId, input2);

        const input3: CreatePostInputModel = {
            title: 'Zed',
            blogId: createdBlogId,
            content: 'content',
            shortDescription: 'ChatGPT'
        };
        const createdPost3 = await createPost(createdBlogId, input3);

        const input4: CreatePostInputModel = {
            title: 'Ben',
            blogId: createdBlogId,
            content: 'content',
            shortDescription: 'Building'
        };
        const createdPost4 = await createPost(createdBlogId, input4);

        await request(app)
            .get('/posts?sortBy=title')
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 4,
                items: [createdPost3, createdPost2, createdPost4, createdPost1]
            });

        await request(app)
            .get('/posts?sortBy=shortDescription&sortDirection=asc')
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 4,
                items: [createdPost2, createdPost1, createdPost4, createdPost3]
            });
    })
    it('should return 200 and portion array of posts with page number and size', async () => {
        const createdBlogId = await getCreatedBlogId();

        const input1: CreatePostInputModel = {
            title: 'Alex',
            blogId: createdBlogId,
            content: 'content',
            shortDescription: 'Align items'
        };
        const createdPost1 = await createPost(createdBlogId, input1);

        const input2: CreatePostInputModel = {
            title: 'John',
            blogId: createdBlogId,
            content: 'content',
            shortDescription: 'About flowers'
        };
        const createdPost2 = await createPost(createdBlogId, input2);

        const input3: CreatePostInputModel = {
            title: 'Zed',
            blogId: createdBlogId,
            content: 'content',
            shortDescription: 'ChatGPT'
        };
        const createdPost3 = await createPost(createdBlogId, input3);

        const input4: CreatePostInputModel = {
            title: 'Ben',
            blogId: createdBlogId,
            content: 'content',
            shortDescription: 'Building'
        };
        const createdPost4 = await createPost(createdBlogId, input4);

        const input5: CreatePostInputModel = {
            title: 'Ben',
            blogId: createdBlogId,
            content: 'content',
            shortDescription: 'Building'
        };
        const createdPost5 = await createPost(createdBlogId, input5);

        const input6: CreatePostInputModel = {
            title: 'Ben',
            blogId: createdBlogId,
            content: 'content',
            shortDescription: 'Building'
        };
        const createdPost6 = await createPost(createdBlogId, input6);

        await request(app)
            .get('/posts')
            .expect(
                constants.HTTP_STATUS_OK,
                {
                    pagesCount: 1,
                    page: 1,
                    pageSize: 10,
                    totalCount: 6,
                    items: [createdPost6, createdPost5, createdPost4, createdPost3, createdPost2, createdPost1]
                }
            );

        await request(app)
            .get('/posts?pageSize=4')
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 2,
                page: 1,
                pageSize: 4,
                totalCount: 6,
                items: [createdPost6, createdPost5, createdPost4, createdPost3]
            });

        await request(app)
            .get('/posts?pageNumber=2&pageSize=2')
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 3,
                page: 2,
                pageSize: 2,
                totalCount: 6,
                items: [createdPost4, createdPost3]
            });
    })
    it(`create 6 posts then: like post 1 by user 1, user 2; like post 2 by user 2, user 3; dislike post 3 by user 1; like post 4 by user 1, user 4, user 2, user 3; like post 5 by user 2, dislike by user 3; like post 6 by user 1, dislike by user 2. Get the posts by user 1 after all likes NewestLikes should be sorted in descending; `, async () => {
        const createdUser1 = await createUser({
            password: 'password1',
            email: 'example1@mail.ru',
            login: 'user1'
        });
        const createdUser2 = await createUser({
            password: 'password1',
            email: 'example2@mail.ru',
            login: 'user2'
        });
        const createdUser3 = await createUser({
            password: 'password1',
            email: 'example3@mail.ru',
            login: 'user3'
        });
        const createdUser4 = await createUser({
            password: 'password1',
            email: 'example4@mail.ru',
            login: 'user4'
        });

        const accessTokenUser1 = await auth({
            loginOrEmail: 'user1',
            password: 'password1'
        });
        const accessTokenUser2 = await auth({
            loginOrEmail: 'user2',
            password: 'password1'
        });
        const accessTokenUser3 = await auth({
            loginOrEmail: 'user3',
            password: 'password1'
        });
        const accessTokenUser4 = await auth({
            loginOrEmail: 'user4',
            password: 'password1'
        });

        const blogId = await getCreatedBlogId();

        // const [
        //     createdPost1,
        //     createdPost2,
        //     createdPost3,
        //     createdPost4,
        //     createdPost5,
        //     createdPost6
        // ] = await Promise.all([
        //     await createPost(blogId),
        //     await createPost(blogId),
        //     await createPost(blogId),
        //     await createPost(blogId),
        //     await createPost(blogId),
        //     await createPost(blogId)
        // ]);

        const [
            createdPost1,
            createdPost2,
            createdPost3,
            createdPost4,
            createdPost5,
            createdPost6
        ] = await Promise.all([
            await createPostInBlog(blogId),
            await createPostInBlog(blogId),
            await createPostInBlog(blogId),
            await createPostInBlog(blogId),
            await createPostInBlog(blogId),
            await createPostInBlog(blogId)
        ]);

        // like post 1 by user 1, user 2;
        await request(app)
            .put(`/posts/${createdPost1.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser1}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)
        await request(app)
            .put(`/posts/${createdPost1.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser2}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        // like post 2 by user 2, user 3
        await request(app)
            .put(`/posts/${createdPost2.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser2}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)
        await request(app)
            .put(`/posts/${createdPost2.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser3}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        // dislike post 3 by user 1
        await request(app)
            .put(`/posts/${createdPost3.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser1}`)
            .send({likeStatus: LikeStatus.Dislike})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        // like post 4 by user 1, user 4, user 2, user 3
        await request(app)
            .put(`/posts/${createdPost4.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser1}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)
        await request(app)
            .put(`/posts/${createdPost4.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser4}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)
        await request(app)
            .put(`/posts/${createdPost4.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser2}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)
        await request(app)
            .put(`/posts/${createdPost4.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser3}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        // like post 5 by user 2, dislike by user 3
        await request(app)
            .put(`/posts/${createdPost5.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser2}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)
        await request(app)
            .put(`/posts/${createdPost5.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser3}`)
            .send({likeStatus: LikeStatus.Dislike})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        // like post 6 by user 1, dislike by user 2
        await request(app)
            .put(`/posts/${createdPost6.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser1}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)
        await request(app)
            .put(`/posts/${createdPost6.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser2}`)
            .send({likeStatus: LikeStatus.Dislike})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        // Get the posts by user 1 after all likes
        await request(app)
            .get(`/blogs/${blogId}/posts`)
            .set('Authorization', `Bearer ${accessTokenUser1}`)
            .expect(constants.HTTP_STATUS_OK)

        const post1User1AfterReactions = await request(app)
            .get(`/posts/${createdPost1.id}/`)
            .set('Authorization', `Bearer ${accessTokenUser1}`)

        expect(post1User1AfterReactions.status).toBe(constants.HTTP_STATUS_OK)
        expect(post1User1AfterReactions.body.extendedLikesInfo.likesCount).toBe(2)
        expect(post1User1AfterReactions.body.extendedLikesInfo.dislikesCount).toBe(0)
        expect(post1User1AfterReactions.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Like)

        const post1User2AfterReactions = await request(app)
            .get(`/posts/${createdPost1.id}/`)
            .auth(accessTokenUser2, {type: 'bearer'})

        console.log('extendedLikeInfo', post1User2AfterReactions.body)

        expect(post1User2AfterReactions.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Like)

        const post1NotAuthAfterReactions = await request(app)
            .get(`/posts/${createdPost1.id}/`)

        expect(post1NotAuthAfterReactions.status).toBe(constants.HTTP_STATUS_OK)
        expect(post1NotAuthAfterReactions.body.extendedLikesInfo.likesCount).toBe(2)
        expect(post1NotAuthAfterReactions.body.extendedLikesInfo.myStatus).toBe(LikeStatus.None)

        const post2User2AfterReactions = await request(app)
            .get(`/posts/${createdPost2.id}/`)
            .auth(accessTokenUser2, {type: 'bearer'})

        expect(post2User2AfterReactions.status).toBe(constants.HTTP_STATUS_OK)
        expect(post2User2AfterReactions.body.extendedLikesInfo.likesCount).toBe(2)
        expect(post2User2AfterReactions.body.extendedLikesInfo.dislikesCount).toBe(0)
        expect(post2User2AfterReactions.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Like)

        const post2User3AfterReactions = await request(app)
            .get(`/posts/${createdPost2.id}/`)
            .auth(accessTokenUser3, {type: 'bearer'})

        expect(post2User3AfterReactions.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Like)

        const post3User1AfterReactions = await request(app)
            .get(`/posts/${createdPost3.id}/`)
            .auth(accessTokenUser1, {type: 'bearer'})

        expect(post3User1AfterReactions.status).toBe(constants.HTTP_STATUS_OK)
        expect(post3User1AfterReactions.body.extendedLikesInfo.likesCount).toBe(0)
        expect(post3User1AfterReactions.body.extendedLikesInfo.dislikesCount).toBe(1)
        expect(post3User1AfterReactions.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Dislike)

        const post3User2AfterReactions = await request(app)
            .get(`/posts/${createdPost3.id}/`)
            .auth(accessTokenUser2, {type: 'bearer'})

        expect(post3User2AfterReactions.body.extendedLikesInfo.myStatus).toBe(LikeStatus.None)

        const post4User1AfterReactions = await request(app)
            .get(`/posts/${createdPost4.id}/`)
            .auth(accessTokenUser1, {type: 'bearer'})

        expect(post4User1AfterReactions.status).toBe(constants.HTTP_STATUS_OK)
        expect(post4User1AfterReactions.body.extendedLikesInfo.likesCount).toBe(4)
        expect(post4User1AfterReactions.body.extendedLikesInfo.dislikesCount).toBe(0)
        expect(post4User1AfterReactions.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Like)

        const post4User2AfterReactions = await request(app)
            .get(`/posts/${createdPost4.id}/`)
            .auth(accessTokenUser2, {type: 'bearer'})

        expect(post4User2AfterReactions.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Like)

        const post4User3AfterReactions = await request(app)
            .get(`/posts/${createdPost4.id}/`)
            .auth(accessTokenUser3, {type: 'bearer'})

        expect(post4User3AfterReactions.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Like)

        const post4User4AfterReactions = await request(app)
            .get(`/posts/${createdPost4.id}/`)
            .auth(accessTokenUser4, {type: 'bearer'})

        expect(post4User4AfterReactions.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Like)

        const post5User2AfterReactions = await request(app)
            .get(`/posts/${createdPost5.id}/`)
            .auth(accessTokenUser2, {type: 'bearer'})

        expect(post5User2AfterReactions.status).toBe(constants.HTTP_STATUS_OK)
        expect(post5User2AfterReactions.body.extendedLikesInfo.likesCount).toBe(1)
        expect(post5User2AfterReactions.body.extendedLikesInfo.dislikesCount).toBe(1)
        expect(post5User2AfterReactions.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Like)

        const post5User3AfterReactions = await request(app)
            .get(`/posts/${createdPost5.id}/`)
            .auth(accessTokenUser3, {type: 'bearer'})

        expect(post5User3AfterReactions.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Dislike)

        const post6User1AfterReactions = await request(app)
            .get(`/posts/${createdPost6.id}/`)
            .auth(accessTokenUser1, {type: 'bearer'})

        expect(post6User1AfterReactions.status).toBe(constants.HTTP_STATUS_OK)
        expect(post6User1AfterReactions.body.extendedLikesInfo.likesCount).toBe(1)
        expect(post6User1AfterReactions.body.extendedLikesInfo.dislikesCount).toBe(1)
        expect(post6User1AfterReactions.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Like)

        const post6User2AfterReactions = await request(app)
            .get(`/posts/${createdPost6.id}/`)
            .auth(accessTokenUser2, {type: 'bearer'})

        expect(post6User2AfterReactions.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Dislike)

        // NewestLikes should be sorted in descending
        expect(
            post1User1AfterReactions.body.extendedLikesInfo.newestLikes.every(
                (newestLike: NewestLikeType, index: number, array: NewestLikeType[]) => {
                    if (index === 0) return true;
                    const currentLikeDate = new Date(newestLike.addedAt).valueOf();
                    const prevLikeDate = new Date(array[index - 1].addedAt).valueOf();
                    if (currentLikeDate < prevLikeDate) return true;
                })
        ).toBeTruthy()

        expect(
            post1User1AfterReactions.body.extendedLikesInfo.newestLikes
        ).toEqual(
            post1User1AfterReactions.body.extendedLikesInfo.newestLikes.sort((a: NewestLikeType, b: NewestLikeType) => {
                if (new Date(a.addedAt).valueOf() < new Date(b.addedAt).valueOf()) return 1;
                if (new Date(a.addedAt).valueOf() === new Date(b.addedAt).valueOf()) return 0;
                return -1;
            })
        )
    }, 30000)
    it(`create post then: like the post by user 1, user 2, user 3, user 4. get the post after each like by user 1. NewestLikes should be sorted in descending`, async () => {
        const createdUser1 = await createUser({
            password: 'password1',
            email: 'example1@mail.ru',
            login: 'user1'
        });
        const createdUser2 = await createUser({
            password: 'password1',
            email: 'example2@mail.ru',
            login: 'user2'
        });
        const createdUser3 = await createUser({
            password: 'password1',
            email: 'example3@mail.ru',
            login: 'user3'
        });
        const createdUser4 = await createUser({
            password: 'password1',
            email: 'example4@mail.ru',
            login: 'user4'
        });

        const accessTokenUser1 = await auth({
            loginOrEmail: 'user1',
            password: 'password1'
        });
        const accessTokenUser2 = await auth({
            loginOrEmail: 'user2',
            password: 'password1'
        });
        const accessTokenUser3 = await auth({
            loginOrEmail: 'user3',
            password: 'password1'
        });
        const accessTokenUser4 = await auth({
            loginOrEmail: 'user4',
            password: 'password1'
        });

        const blogId = await getCreatedBlogId();
        const createdPost1 = await createPost(blogId);

        // like post 1 by user 1, 2, 3, 4;
        await request(app)
            .put(`/posts/${createdPost1.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser1}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)
        await request(app)
            .put(`/posts/${createdPost1.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser2}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)
        await request(app)
            .put(`/posts/${createdPost1.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser3}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)
        await request(app)
            .put(`/posts/${createdPost1.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser4}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        // Get the posts by user 1 after all likes
        await request(app)
            .get(`/blogs/${blogId}/posts`)
            .set('Authorization', `Bearer ${accessTokenUser1}`)
            .expect(constants.HTTP_STATUS_OK)

        const post1ForUser1Reactions1 = await request(app)
            .get(`/posts/${createdPost1.id}/`)
            .set('Authorization', `Bearer ${accessTokenUser1}`)

        expect([
            {
                login: post1ForUser1Reactions1.body.extendedLikesInfo.newestLikes[0].login,
                userId: post1ForUser1Reactions1.body.extendedLikesInfo.newestLikes[0].userId
            },
            {
                login: post1ForUser1Reactions1.body.extendedLikesInfo.newestLikes[1].login,
                userId: post1ForUser1Reactions1.body.extendedLikesInfo.newestLikes[1].userId
            },
            {
                login: post1ForUser1Reactions1.body.extendedLikesInfo.newestLikes[2].login,
                userId: post1ForUser1Reactions1.body.extendedLikesInfo.newestLikes[2].userId
            },
        ]).toEqual([
            {
                login: createdUser4.login,
                userId: createdUser4.id,
            },
            {
                login: createdUser3.login,
                userId: createdUser3.id,
            },
            {
                login: createdUser2.login,
                userId: createdUser2.id,
            },
        ])

        await request(app)
            .put(`/posts/${createdPost1.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser1}`)
            .send({likeStatus: LikeStatus.None})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        await request(app)
            .put(`/posts/${createdPost1.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser1}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        const post1ForUser1Reactions2 = await request(app)
            .get(`/posts/${createdPost1.id}/`)
            .set('Authorization', `Bearer ${accessTokenUser1}`)

        expect([
            {
                login: post1ForUser1Reactions2.body.extendedLikesInfo.newestLikes[0].login,
                userId: post1ForUser1Reactions2.body.extendedLikesInfo.newestLikes[0].userId
            },
            {
                login: post1ForUser1Reactions2.body.extendedLikesInfo.newestLikes[1].login,
                userId: post1ForUser1Reactions2.body.extendedLikesInfo.newestLikes[1].userId
            },
            {
                login: post1ForUser1Reactions2.body.extendedLikesInfo.newestLikes[2].login,
                userId: post1ForUser1Reactions2.body.extendedLikesInfo.newestLikes[2].userId
            },
        ]).toEqual([
            {
                login: createdUser1.login,
                userId: createdUser1.id,
            },
            {
                login: createdUser4.login,
                userId: createdUser4.id,
            },
            {
                login: createdUser3.login,
                userId: createdUser3.id,
            },
        ]);


    }, 40000)

    // testing get '/posts/:id' api
    it('should return 404 for not existing post', async () => {
        await request(app)
            .get(`/posts/${notExistingId}`)
            .expect(constants.HTTP_STATUS_NOT_FOUND)
    })
    it('should return 200 and existing posts', async () => {
        const createdBlogId = await getCreatedBlogId();
        const createdPost = await createPost(createdBlogId);

        await request(app)
            .get(`/posts/${createdPost?.id}`)
            .expect(constants.HTTP_STATUS_OK, createdPost)
    })

    // testing delete '/posts/:id' api
    it('should return 401 for not auth user', async () => {
        await request(app)
            .delete(`/posts/${notExistingId}`)
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    })
    it('should return 404 for not existing post', async () => {
        await request(app)
            .delete(`/posts/${notExistingId}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .expect(constants.HTTP_STATUS_NOT_FOUND)
    })
    it('should return 204 for existing post', async () => {
        const createdBlogId = await getCreatedBlogId();
        const createdPost = await createPost(createdBlogId);
        await request(app)
            .delete(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .expect(constants.HTTP_STATUS_NO_CONTENT)
    })

    // testing post '/posts' api
    it(`shouldn't create post if not auth user`, async () => {
        const createdBlogId = await getCreatedBlogId();
        const input: CreatePostInputModel = {
            title: 'title',
            blogId: createdBlogId,
            content: 'content',
            shortDescription: 'shortDescription'
        };
        await request(app)
            .post('/posts')
            .send(input)
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)

        await request(app)
            .get('/posts')
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            })
    })
    it(`shouldn't create post with incorrect input data`, async () => {
        const createdBlogId = await getCreatedBlogId();
        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.title1, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.title2, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.title3, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.title4, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.title5, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.title6, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.shortDescription1, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.shortDescription2, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.shortDescription3, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.shortDescription4, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.shortDescription5, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.shortDescription6, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.content1, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.content2, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.content3, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.content4, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.content5, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.content6, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.blogId1)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.blogId2)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.blogId3)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.blogId4)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.blogId5)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.blogId6)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .get('/posts')
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            })
    })
    it(`should create post with correct input data`, async () => {
        const createdBlogId = await getCreatedBlogId();
        const input: CreatePostInputModel = {
            title: 'title',
            blogId: createdBlogId,
            content: 'content',
            shortDescription: 'shortDescription'
        };
        const createResponse = await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(input)
            .expect(constants.HTTP_STATUS_CREATED)

        const createdPost: GetMappedPostOutputModel = createResponse?.body;
        const expectedPost: GetMappedPostOutputModel = {
            ...input,
            id: createdPost?.id,
            title: createdPost.title,
            blogId: createdPost.blogId,
            content: createdPost.content,
            shortDescription: createdPost.shortDescription,
            blogName: createdPost.blogName,
            createdAt: createdPost.createdAt,
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: LikeStatus.None,
                newestLikes: [],
            }
        };

        expect(createdPost).toEqual(expectedPost);

        await request(app)
            .get('/posts')
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [createdPost]
            })
    })

    // testing put '/posts/:id' api
    it(`shouldn't update post if not auth user`, async () => {
        const createdBlogId = await getCreatedBlogId();
        const createdPost = await createPost(createdBlogId);
        const input: CreatePostInputModel = {
            title: 'title',
            blogId: createdBlogId,
            content: 'content',
            shortDescription: 'shortDescription'
        };
        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .send(input)
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)

        await request(app)
            .get('/posts')
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [createdPost]
            })
    })
    it(`shouldn't update post with incorrect input data`, async () => {
        const createdBlogId = await getCreatedBlogId();
        const createdPost = await createPost(createdBlogId);

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.title1, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.title2, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.title3, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.title4, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.title5, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.title6, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.shortDescription1, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.shortDescription2, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.shortDescription3, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.shortDescription4, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.shortDescription5, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.shortDescription6, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.content1, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.content2, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.content3, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.content4, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.content5, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...invalidInputData.content6, blogId: createdBlogId})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.blogId1)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.blogId2)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.blogId3)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.blogId4)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.blogId5)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.blogId6)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .get('/posts')
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [createdPost]
            })
    })
    it(`shouldn't update post if not exist`, async () => {
        const createdBlogId = await getCreatedBlogId();
        const input: CreatePostInputModel = {
            title: 'title',
            blogId: createdBlogId,
            content: 'content',
            shortDescription: 'shortDescription'
        };
        await request(app)
            .put(`/posts/${notExistingId}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(input)
            .expect(constants.HTTP_STATUS_NOT_FOUND)

        await request(app)
            .get('/posts')
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            })
    })
    it(`should update post with correct input data`, async () => {
        const createdBlogId = await getCreatedBlogId();
        const dataForCreate: CreatePostInputModel = {
            title: 'title',
            blogId: createdBlogId,
            content: 'content',
            shortDescription: 'shortDescription'
        };
        const createdPost = await createPost(createdBlogId);

        await request(app)
            .get('/posts')
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [createdPost]
            })

        const dataForUpdate: CreatePostInputModel = {
            title: 'title2',
            blogId: createdBlogId,
            content: 'content2',
            shortDescription: 'shortDescription2'
        };

        await request(app)
            .put(`/posts/${createdPost?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(dataForUpdate)
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        const updatedPost = {...createdPost, ...dataForUpdate};

        await request(app)
            .get('/posts')
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [updatedPost]
            })
    })

});

describe('comments in post', () => {
    const encodedBase64Token = getEncodedAuthToken();
    const notExistingId = new ObjectId();

    const createUser = async (input: CreateUserInputModel = {
        login: 'login12',
        email: 'example@gmail.com',
        password: 'pass123',
    }) => {
        const createResponse = await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(input)
            .expect(constants.HTTP_STATUS_CREATED)

        const createdUser: GetMappedUserOutputModel = createResponse?.body;
        return createdUser;
    };

    const auth = async (input: SigninInputModel = {
        loginOrEmail: 'example@gmail.com',
        password: 'pass123'
    }) => {
        const {loginOrEmail, password} = input;
        const authData = await request(app)
            .post('/auth/login')
            .send({loginOrEmail, password})
            .expect(constants.HTTP_STATUS_OK)

        return authData.body.accessToken;
    }

    const createBlog = async (input: CreateBlogInputModel | undefined = {
        name: 'blog1',
        description: 'about blog1',
        websiteUrl: 'https://google.com'
    }) => {
        const createResponse = await request(app)
            .post('/blogs')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(input)
            .expect(constants.HTTP_STATUS_CREATED)

        const createdBlog: GetMappedBlogOutputModel = createResponse?.body;
        return createdBlog;
    }

    const getCreatedBlogId = async () => {
        const result = await createBlog();
        const createdBlogId = result.id;
        return createdBlogId;
    };

    const createPost = async (blogId: string, input?: Omit<CreatePostInputModel, 'blogId'>) => {
        const defaultPayload = {
            title: 'title',
            content: 'content',
            shortDescription: 'shortDescription',
            ...input
        }

        const createResponse = await request(app)
            .post('/posts')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send({...defaultPayload, blogId})
            .expect(constants.HTTP_STATUS_CREATED)

        const createdPost: GetMappedPostOutputModel = createResponse?.body;
        return createdPost;
    }

    let createdUser: GetMappedUserOutputModel;
    let accessToken: string;
    let createdBlogId: string;
    let createdPost: GetMappedPostOutputModel;

    beforeAll(async () => {
        createdUser = await createUser({
            password: 'password1',
            email: 'email1@mail.ru',
            login: 'login1'
        });
        accessToken = await auth({
            loginOrEmail: 'login1',
            password: 'password1'
        });
        createdBlogId = await getCreatedBlogId();
        createdPost = await createPost(createdBlogId);
    })

    // testing get '/posts/:postId/comments' api
    it(`should return 404 if post not exist`, async () => {
        await request(app)
            .get(`/posts/${notExistingId}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(constants.HTTP_STATUS_NOT_FOUND)
    })
    it(`should return 200 and arrays of comments`, async () => {
        const createdComment1 = await request(app)
            .post(`/posts/${createdPost.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({content: 'Hello world, it`s my first comment!'})
            .expect(constants.HTTP_STATUS_CREATED)
        const createdComment2 = await request(app)
            .post(`/posts/${createdPost.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({content: 'Hello world, it`s my second comment!'})
            .expect(constants.HTTP_STATUS_CREATED)
        await request(app)
            .get(`/posts/${createdPost.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [createdComment2.body, createdComment1.body]
            })
    })
    it(`create 6 comments then: like comment 1 by user 1, user 2; like comment 2 by user 2, user 3; dislike comment 3 by user 1; like comment 4 by user 1, user 4, user 2, user 3; like comment 5 by user 2, dislike by user 3; like comment 6 by user 1, dislike by user 2`, async () => {
        const createdUser1 = await createUser({
            password: 'password1',
            email: 'example1@mail.ru',
            login: 'user1'
        });
        const createdUser2 = await createUser({
            password: 'password1',
            email: 'example2@mail.ru',
            login: 'user2'
        });
        const createdUser3 = await createUser({
            password: 'password1',
            email: 'example3@mail.ru',
            login: 'user3'
        });
        const createdUser4 = await createUser({
            password: 'password1',
            email: 'example4@mail.ru',
            login: 'user4'
        });

        const accessTokenUser1 = await auth({
            loginOrEmail: 'user1',
            password: 'password1'
        });
        const accessTokenUser2 = await auth({
            loginOrEmail: 'user2',
            password: 'password1'
        });
        const accessTokenUser3 = await auth({
            loginOrEmail: 'user3',
            password: 'password1'
        });
        const accessTokenUser4 = await auth({
            loginOrEmail: 'user4',
            password: 'password1'
        });

        const createdComment1 = await request(app)
            .post(`/posts/${createdPost.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({content: '11111111111111 first comment'})
            .expect(constants.HTTP_STATUS_CREATED)
        const createdComment2 = await request(app)
            .post(`/posts/${createdPost.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({content: '22222222222222 second comment'})
            .expect(constants.HTTP_STATUS_CREATED)
        const createdComment3 = await request(app)
            .post(`/posts/${createdPost.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({content: '333333333333333 third comment'})
            .expect(constants.HTTP_STATUS_CREATED)
        const createdComment4 = await request(app)
            .post(`/posts/${createdPost.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({content: '444444444444444 fourth comment'})
            .expect(constants.HTTP_STATUS_CREATED)
        const createdComment5 = await request(app)
            .post(`/posts/${createdPost.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({content: '555555555555555 fifth comment'})
            .expect(constants.HTTP_STATUS_CREATED)
        const createdComment6 = await request(app)
            .post(`/posts/${createdPost.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({content: '6666666666666666 sixth comment'})
            .expect(constants.HTTP_STATUS_CREATED)

        // like comment 1 by user 1, user 2;
        await request(app)
            .put(`/comments/${createdComment1.body.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser1}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)
        await request(app)
            .put(`/comments/${createdComment1.body.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser2}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        // like comment 2 by user 2, user 3
        await request(app)
            .put(`/comments/${createdComment2.body.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser2}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)
        await request(app)
            .put(`/comments/${createdComment2.body.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser3}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        // dislike comment 3 by user 1
        await request(app)
            .put(`/comments/${createdComment3.body.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser1}`)
            .send({likeStatus: LikeStatus.Dislike})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        // like comment 4 by user 1, user 4, user 2, user 3
        await request(app)
            .put(`/comments/${createdComment4.body.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser1}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)
        await request(app)
            .put(`/comments/${createdComment4.body.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser4}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)
        await request(app)
            .put(`/comments/${createdComment4.body.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser2}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)
        await request(app)
            .put(`/comments/${createdComment4.body.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser3}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        // like comment 5 by user 2, dislike by user 3
        await request(app)
            .put(`/comments/${createdComment5.body.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser2}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)
        await request(app)
            .put(`/comments/${createdComment5.body.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser3}`)
            .send({likeStatus: LikeStatus.Dislike})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        // like comment 6 by user 1, dislike by user 2
        await request(app)
            .put(`/comments/${createdComment6.body.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser1}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)
        await request(app)
            .put(`/comments/${createdComment6.body.id}/like-status`)
            .set('Authorization', `Bearer ${accessTokenUser2}`)
            .send({likeStatus: LikeStatus.Dislike})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        // Get the comments by user 1 after all likes
        await request(app)
            .get(`/posts/${createdPost.id}/comments`)
            .set('Authorization', `Bearer ${accessTokenUser1}`)
            .expect(constants.HTTP_STATUS_OK)

        const comment1User1AfterReactions = await request(app)
            .get(`/comments/${createdComment1.body.id}/`)
            .set('Authorization', `Bearer ${accessTokenUser1}`)

        expect(comment1User1AfterReactions.status).toBe(constants.HTTP_STATUS_OK)
        expect(comment1User1AfterReactions.body.likesInfo.likesCount).toBe(2)
        expect(comment1User1AfterReactions.body.likesInfo.dislikesCount).toBe(0)
        expect(comment1User1AfterReactions.body.likesInfo.myStatus).toBe(LikeStatus.Like)

        const comment1User2AfterReactions = await request(app)
            .get(`/comments/${createdComment1.body.id}/`)
            .auth(accessTokenUser2, {type: 'bearer'})

        expect(comment1User2AfterReactions.body.likesInfo.myStatus).toBe(LikeStatus.Like)

        const comment1NotAuthAfterReactions = await request(app)
            .get(`/comments/${createdComment1.body.id}/`)

        expect(comment1NotAuthAfterReactions.status).toBe(constants.HTTP_STATUS_OK)
        expect(comment1NotAuthAfterReactions.body.likesInfo.likesCount).toBe(2)
        expect(comment1NotAuthAfterReactions.body.likesInfo.myStatus).toBe(LikeStatus.None)

        const comment2User2AfterReactions = await request(app)
            .get(`/comments/${createdComment2.body.id}/`)
            .auth(accessTokenUser2, {type: 'bearer'})

        expect(comment2User2AfterReactions.status).toBe(constants.HTTP_STATUS_OK)
        expect(comment2User2AfterReactions.body.likesInfo.likesCount).toBe(2)
        expect(comment2User2AfterReactions.body.likesInfo.dislikesCount).toBe(0)
        expect(comment2User2AfterReactions.body.likesInfo.myStatus).toBe(LikeStatus.Like)

        const comment2User3AfterReactions = await request(app)
            .get(`/comments/${createdComment2.body.id}/`)
            .auth(accessTokenUser3, {type: 'bearer'})

        expect(comment2User3AfterReactions.body.likesInfo.myStatus).toBe(LikeStatus.Like)

        const comment3User1AfterReactions = await request(app)
            .get(`/comments/${createdComment3.body.id}/`)
            .auth(accessTokenUser1, {type: 'bearer'})

        expect(comment3User1AfterReactions.status).toBe(constants.HTTP_STATUS_OK)
        expect(comment3User1AfterReactions.body.likesInfo.likesCount).toBe(0)
        expect(comment3User1AfterReactions.body.likesInfo.dislikesCount).toBe(1)
        expect(comment3User1AfterReactions.body.likesInfo.myStatus).toBe(LikeStatus.Dislike)

        const comment3User2AfterReactions = await request(app)
            .get(`/comments/${createdComment3.body.id}/`)
            .auth(accessTokenUser2, {type: 'bearer'})

        expect(comment3User2AfterReactions.body.likesInfo.myStatus).toBe(LikeStatus.None)

        const comment4User1AfterReactions = await request(app)
            .get(`/comments/${createdComment4.body.id}/`)
            .auth(accessTokenUser1, {type: 'bearer'})

        expect(comment4User1AfterReactions.status).toBe(constants.HTTP_STATUS_OK)
        expect(comment4User1AfterReactions.body.likesInfo.likesCount).toBe(4)
        expect(comment4User1AfterReactions.body.likesInfo.dislikesCount).toBe(0)
        expect(comment4User1AfterReactions.body.likesInfo.myStatus).toBe(LikeStatus.Like)

        const comment4User2AfterReactions = await request(app)
            .get(`/comments/${createdComment4.body.id}/`)
            .auth(accessTokenUser2, {type: 'bearer'})

        expect(comment4User2AfterReactions.body.likesInfo.myStatus).toBe(LikeStatus.Like)

        const comment4User3AfterReactions = await request(app)
            .get(`/comments/${createdComment4.body.id}/`)
            .auth(accessTokenUser3, {type: 'bearer'})

        expect(comment4User3AfterReactions.body.likesInfo.myStatus).toBe(LikeStatus.Like)

        const comment4User4AfterReactions = await request(app)
            .get(`/comments/${createdComment4.body.id}/`)
            .auth(accessTokenUser4, {type: 'bearer'})

        expect(comment4User4AfterReactions.body.likesInfo.myStatus).toBe(LikeStatus.Like)

        const comment5User2AfterReactions = await request(app)
            .get(`/comments/${createdComment5.body.id}/`)
            .auth(accessTokenUser2, {type: 'bearer'})

        expect(comment5User2AfterReactions.status).toBe(constants.HTTP_STATUS_OK)
        expect(comment5User2AfterReactions.body.likesInfo.likesCount).toBe(1)
        expect(comment5User2AfterReactions.body.likesInfo.dislikesCount).toBe(1)
        expect(comment5User2AfterReactions.body.likesInfo.myStatus).toBe(LikeStatus.Like)

        const comment5User3AfterReactions = await request(app)
            .get(`/comments/${createdComment5.body.id}/`)
            .auth(accessTokenUser3, {type: 'bearer'})

        expect(comment5User3AfterReactions.body.likesInfo.myStatus).toBe(LikeStatus.Dislike)

        const comment6User1AfterReactions = await request(app)
            .get(`/comments/${createdComment6.body.id}/`)
            .auth(accessTokenUser1, {type: 'bearer'})

        expect(comment6User1AfterReactions.status).toBe(constants.HTTP_STATUS_OK)
        expect(comment6User1AfterReactions.body.likesInfo.likesCount).toBe(1)
        expect(comment6User1AfterReactions.body.likesInfo.dislikesCount).toBe(1)
        expect(comment6User1AfterReactions.body.likesInfo.myStatus).toBe(LikeStatus.Like)

        const comment6User2AfterReactions = await request(app)
            .get(`/comments/${createdComment6.body.id}/`)
            .auth(accessTokenUser2, {type: 'bearer'})

        expect(comment6User2AfterReactions.body.likesInfo.myStatus).toBe(LikeStatus.Dislike)

    }, 20000)

    // testing post '/posts/:postId/comments' api
    it(`should return 401 if not auth`, async () => {
        const createdComment = await request(app)
            .post(`/posts/${createdPost.id}/comments`)
            .send({content: 'Hello world, it`s my first comment!'})
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    })
    it(`should return 201 and the newly created comment in post if correct input data`, async () => {
        const createdComment3 = await request(app)
            .post(`/posts/${createdPost.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({content: 'Hello world, it`s my third comment!'})
            .expect(constants.HTTP_STATUS_CREATED)

        const {
            id: commentId,
            createdAt
        } = createdComment3.body;

        expect(createdComment3.body.content).toBe('Hello world, it`s my third comment!');
        expect(createdComment3.body.commentatorInfo.userLogin).toBe('login1');
    })
    it(`shouldn't create comment in post if incorrect input data and return 400`, async () => {
        await request(app)
            .post(`/posts/${createdPost.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidInputData.comment1)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post(`/posts/${createdPost.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidInputData.comment2)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post(`/posts/${createdPost.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidInputData.comment3)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post(`/posts/${createdPost.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidInputData.comment4)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post(`/posts/${createdPost.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidInputData.comment5)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post(`/posts/${createdPost.id}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidInputData.comment6)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)
    })
    it(`should return 404 if post not exist`, async () => {
        await request(app)
            .post(`/posts/${notExistingId}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({content: 'Hello world, it`s my first comment!'})
            .expect(constants.HTTP_STATUS_NOT_FOUND)
    })

});
