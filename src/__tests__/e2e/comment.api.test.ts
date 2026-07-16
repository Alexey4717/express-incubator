import {MongoMemoryServer} from "mongodb-memory-server";
import request from "supertest";
import {ObjectId} from "mongodb";
import {constants} from "http2";

import {invalidInputData} from "./post.api.test";
import {getEncodedAuthToken} from "../../helpers";
import {CreateUserInputModel} from "../../models/UserModels/CreateUserInputModel";
import {app} from "../../index";
import {GetMappedUserOutputModel} from "../../models/UserModels/GetUserOutputModel";
import {SigninInputModel} from "../../models/AuthModels/SigninInputModel";
import {CreateBlogInputModel} from "../../models/BlogModels/CreateBlogInputModel";
import {GetMappedBlogOutputModel} from "../../models/BlogModels/GetBlogOutputModel";
import {CreatePostInputModel} from "../../models/PostModels/CreatePostInputModel";
import {GetMappedPostOutputModel} from "../../models/PostModels/GetPostOutputModel";
import {GetMappedCommentOutputModel} from "../../models/CommentsModels/GetCommentOutputModel";
import {LikeStatus} from '../../types/common';


describe('CRUD comments', () => {
    jest.setTimeout(1000 * 60)
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
            .send({loginOrEmail: loginOrEmail,password: password})
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

    const createCommentInPost = async ({postId, content}: { postId: string, content: string }) => {
        const result = await request(app)
            .post(`/posts/${postId}/comments`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({content})
            .expect(constants.HTTP_STATUS_CREATED)
        return result.body;
    };

    let createdUser: GetMappedUserOutputModel;
    let createdUser2: GetMappedUserOutputModel;
    let accessToken: string;
    let otherUserAccessToken: string;
    let createdBlogId: string;
    let createdPost: GetMappedPostOutputModel;
    let createdComment: GetMappedCommentOutputModel;

    let mongoMemoryServer: MongoMemoryServer

    beforeAll(async () => {
        mongoMemoryServer = await MongoMemoryServer.create()
        const mongoUri = mongoMemoryServer.getUri()
        process.env['MONGO_URI'] = mongoUri

        await request(app)
            .delete('/testing/all-data')
            .expect(constants.HTTP_STATUS_NO_CONTENT);

        createdUser = await createUser({
            password: 'password1',
            email: 'email1@mail.ru',
            login: 'login1'
        });
        createdUser2 = await createUser({
            password: 'password12',
            email: 'email2@mail.ru',
            login: 'gggggg'
        });
        accessToken = await auth({
            loginOrEmail: 'login1',
            password: 'password1'
        });
        otherUserAccessToken = await auth ({
            loginOrEmail: 'gggggg',
            password: 'password12'
        })
        createdBlogId = await getCreatedBlogId();
        createdPost = await createPost(createdBlogId);
        createdComment = await createCommentInPost({
            postId: createdPost.id,
            content: 'Hello world, it`s my first comment!'
        })
    })

    // testing get '/comments/:commentId' api
    it(`should return 404 if comment not exist`, async () => {
        await request(app)
            .get(`/comments/${notExistingId}/`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(constants.HTTP_STATUS_NOT_FOUND)
    })
    it(`should return 200 if comment exist`, async () => {
        await request(app)
            .get(`/comments/${createdComment.id}/`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(constants.HTTP_STATUS_OK)
    })
    it(`should return 200 and correct likes count`, async () => {
        const result = await request(app)
            .get(`/comments/${createdComment.id}/`)
            .set('Authorization', `Bearer ${accessToken}`)


        expect(result.status).toBe(constants.HTTP_STATUS_OK)

        await request(app)
            .put(`/comments/${createdComment.id}/like-status`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({likeStatus: LikeStatus.Like})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        const commentAfterLike = await  request(app)
            .get(`/comments/${createdComment.id}/`)
            .auth(accessToken, {type: 'bearer'})

        expect(commentAfterLike.status).toBe(constants.HTTP_STATUS_OK)
        expect(commentAfterLike.body.likesInfo.likesCount).toBe(1)
        expect(commentAfterLike.body.likesInfo.myStatus).toBe(LikeStatus.Like)

    })

    // testing put '/comments/:commentId' api
    it(`should return 401 if not auth`, async () => {
        await request(app)
            .put(`/comments/${createdComment.id}/`)
            .send({content: 'Hello world, it`s my second comment!'})
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    })
    it(`should return 404 if comment not exist`, async () => {
        await request(app)
            .put(`/comments/${notExistingId}/`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({content: 'Hello world, it`s my second comment!'})
            .expect(constants.HTTP_STATUS_NOT_FOUND)
    })
    it(`should return 403 if comment not own user`, async () => {
        await request(app)
            .put(`/comments/${createdComment.id}/`)
            .set('Authorization', `Bearer ${otherUserAccessToken}`)
            .send({content: 'Hello world, it`s my second comment!'})
            .expect(constants.HTTP_STATUS_FORBIDDEN)
    })
    it(`should return 204 if correct input data`, async () => {
        await request(app)
            .put(`/comments/${createdComment.id}/`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({content: 'Hello world, it`s my other comment!'})
            .expect(constants.HTTP_STATUS_NO_CONTENT)
    })
    it(`should return 400 if incorrect input data`, async () => {
        await request(app)
            .put(`/comments/${createdComment.id}/`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidInputData.comment1)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/comments/${createdComment.id}/`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidInputData.comment2)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/comments/${createdComment.id}/`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidInputData.comment3)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/comments/${createdComment.id}/`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidInputData.comment4)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/comments/${createdComment.id}/`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidInputData.comment5)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .put(`/comments/${createdComment.id}/`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidInputData.comment6)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)
    })

    // testing delete '/comments/:commentId' api
    it(`should return 401 if not auth`, async () => {
        await request(app)
            .delete(`/comments/${createdComment.id}/`)
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    })
    it(`should return 404 if comment not exist`, async () => {
        await request(app)
            .delete(`/comments/${notExistingId}/`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(constants.HTTP_STATUS_NOT_FOUND)
    })
    it(`should return 403 if comment not own user`, async () => {
        await request(app)
            .delete(`/comments/${createdComment.id}/`)
            .set('Authorization', `Bearer ${otherUserAccessToken}`)
            .expect(constants.HTTP_STATUS_FORBIDDEN)
    })
    it(`should return 204 if comment exist`, async () => {
        await request(app)
            .delete(`/comments/${createdComment.id}/`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(constants.HTTP_STATUS_NO_CONTENT)
    })

})