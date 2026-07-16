import request from "supertest";
import {constants} from "http2";
import {ObjectId} from 'mongodb';

import {getEncodedAuthToken} from "../../helpers";
import {CreateUserInputModel} from "../../models/UserModels/CreateUserInputModel";
import {app} from "../../index";
import {GetMappedUserOutputModel} from "../../models/UserModels/GetUserOutputModel";
import jwt, {JwtPayload, VerifyErrors} from "jsonwebtoken";
import {settings} from "../../settings";
import {MongoMemoryServer} from "mongodb-memory-server";


describe('', () => {
    const adminBasicToken = getEncodedAuthToken();
    const notExistsId = new ObjectId();

    const createUser = async (input: CreateUserInputModel = {
        login: 'login12',
        email: 'example@gmail.com',
        password: 'pass123',
    }) => {
        const createResponse = await request(app)
            .post('/users')
            .set('Authorization', `Basic ${adminBasicToken}`)
            .send(input)
            .expect(constants.HTTP_STATUS_CREATED)

        const createdUser: GetMappedUserOutputModel = createResponse?.body;
        return createdUser;
    };

    const getRefreshTokenFromCookie = (cookie?: string[]) => {
        const result = cookie
            ?.find((item: string) => item.split('=')[0] === 'refreshToken')
            ?.split('=')[1];
        return result?.split(';')[0]
    };

    const getExpiredToken = async (token: string) => {
        return await jwt.verify(
            token,
            settings.REFRESH_JWT_SECRET,
            {clockTimestamp: new Date('12-12-3000').valueOf()},
            (error: VerifyErrors | null, decoded?: JwtPayload | string) => {
                expect(error).not.toBeUndefined();
                expect(decoded).toBeUndefined();
            }
        );
    };

    let mongoMemoryServer: MongoMemoryServer;

    beforeAll(async () => {
        mongoMemoryServer = await MongoMemoryServer.create();
        const mongoUri = mongoMemoryServer.getUri();
        process.env['MONGO_URI'] = mongoUri;
    }, 10000)

    beforeEach(async () => {
        await request(app)
            .delete('/testing/all-data')
            .expect(constants.HTTP_STATUS_NO_CONTENT)
    }, 10000)

    // testing get '/security/devices' api
    it('should return 200 and empty array if correct refreshToken in cookie', async () => {
        await createUser();
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'login12', password: 'pass123'})
            .expect(constants.HTTP_STATUS_OK)

        const loginCookies = loginResponse.headers['set-cookie'];
        const refreshToken = getRefreshTokenFromCookie(loginCookies);

        expect(refreshToken).not.toBeUndefined();

        const response = await request(app)
            .get('/security/devices')
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(constants.HTTP_STATUS_OK);

        expect(response.body).toHaveLength(1);
    }, 15000)
    it(`should return 401 if refreshToken inside cookie is missing`, async () => {
        await request(app)
            .get('/security/devices')
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    }, 10000)
    it(`should return 401 if refreshToken inside cookie is incorrect`, async () => {
        await request(app)
            .get('/security/devices')
            .set('Cookie', [`refreshToken=incorrectToken`])
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    }, 10000)
    it(`should return 401 if refreshToken inside cookie is expired`, async () => {
        await createUser();
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'login12', password: 'pass123'})
            .expect(constants.HTTP_STATUS_OK)

        const loginCookies = loginResponse.headers['set-cookie']

        const refreshToken = getRefreshTokenFromCookie(loginCookies) as string;

        expect(refreshToken).not.toBeUndefined();

        const expiredToken = await getExpiredToken(refreshToken);
        await request(app)
            .get('/security/devices')
            .set('Cookie', [`refreshToken=${expiredToken}`])
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    }, 20000)

    // testing delete '/security/devices/:id' api
    it('should return 204 if correct refreshToken in cookie', async () => {
        await createUser();
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'login12', password: 'pass123'})
            .expect(constants.HTTP_STATUS_OK)

        const loginCookies = loginResponse.headers['set-cookie'];
        const refreshToken = getRefreshTokenFromCookie(loginCookies);

        expect(refreshToken).not.toBeUndefined();

        const allDevicesResponse = await request(app)
            .get('/security/devices')
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(constants.HTTP_STATUS_OK);

        expect(allDevicesResponse.body).toHaveLength(1);

        const response = await request(app)
            .delete(`/security/devices/${allDevicesResponse.body[0].deviceId}`)
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(constants.HTTP_STATUS_NO_CONTENT);

        const allDevicesResponse2 = await request(app)
            .get('/security/devices')
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(constants.HTTP_STATUS_UNAUTHORIZED);

        // невозможно протестить с разных устройств, т.к. тест запускается с одного при логине
    }, 10000)
    it(`should return 401 if refreshToken inside cookie is missing`, async () => {
        await request(app)
            .delete(`/security/devices/${notExistsId}`)
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    }, 10000)
    it(`should return 401 if refreshToken inside cookie is incorrect`, async () => {
        await request(app)
            .delete(`/security/devices/${notExistsId}`)
            .set('Cookie', [`refreshToken=incorrectToken`])
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    }, 10000)
    it(`should return 401 if refreshToken inside cookie is expired`, async () => {
        await createUser();
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'login12', password: 'pass123'})
            .expect(constants.HTTP_STATUS_OK)

        const loginCookies = loginResponse.headers['set-cookie']

        const refreshToken = getRefreshTokenFromCookie(loginCookies) as string;

        expect(refreshToken).not.toBeUndefined();

        const expiredToken = await getExpiredToken(refreshToken);
        await request(app)
            .delete(`/security/devices/${notExistsId}`)
            .set('Cookie', [`refreshToken=${expiredToken}`])
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    }, 20000)
    it(`should return 404 if deviceId inside query params not exists`, async () => {
        await createUser();
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'login12', password: 'pass123'})
            .expect(constants.HTTP_STATUS_OK)

        const loginCookies = loginResponse.headers['set-cookie']

        const refreshToken = getRefreshTokenFromCookie(loginCookies) as string;

        expect(refreshToken).not.toBeUndefined();

        await request(app)
            .delete(`/security/devices/${notExistsId}`)
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(constants.HTTP_STATUS_NOT_FOUND)
    }, 20000)
    it(`should return 403 if deviceId inside query params own other user`, async () => {
        await createUser();
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'login12', password: 'pass123'})
            .expect(constants.HTTP_STATUS_OK)

        const loginCookies = loginResponse.headers['set-cookie']

        const refreshToken = getRefreshTokenFromCookie(loginCookies) as string;

        expect(refreshToken).not.toBeUndefined();

        const allDevicesResponseUser1 = await request(app)
            .get('/security/devices')
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(constants.HTTP_STATUS_OK);

        expect(allDevicesResponseUser1.body).toHaveLength(1);

        await createUser({
            login: 'login222',
            email: 'example222@gmail.com',
            password: 'pass12345'
        });
        const loginResponse2 = await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'login222', password: 'pass12345'})
            .expect(constants.HTTP_STATUS_OK)

        const loginCookies2 = loginResponse2.headers['set-cookie']

        const refreshToken2 = getRefreshTokenFromCookie(loginCookies2) as string;

        expect(refreshToken2).not.toBeUndefined();

        const allDevicesResponseUser2 = await request(app)
            .get('/security/devices')
            .set('Cookie', [`refreshToken=${refreshToken2}`])
            .expect(constants.HTTP_STATUS_OK);

        expect(allDevicesResponseUser2.body).toHaveLength(1);

        await request(app)
            .delete(`/security/devices/${allDevicesResponseUser2.body[0].deviceId}`)
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(constants.HTTP_STATUS_FORBIDDEN)
    }, 20000)

    // testing delete '/security/devices' api
    it('should return 204 if correct refreshToken in cookie', async () => {
        await createUser();
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'login12', password: 'pass123'})
            .expect(constants.HTTP_STATUS_OK)

        const loginCookies = loginResponse.headers['set-cookie'];
        const refreshToken = getRefreshTokenFromCookie(loginCookies);

        expect(refreshToken).not.toBeUndefined();

        await request(app)
            .delete('/security/devices')
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(constants.HTTP_STATUS_NO_CONTENT);

        // Непонятно как протестить с разных девайсов

        const response = await request(app)
            .get('/security/devices')
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(constants.HTTP_STATUS_OK);

        expect(response.body).toHaveLength(1);
    }, 15000)
    it(`should return 401 if refreshToken inside cookie is missing`, async () => {
        await request(app)
            .delete('/security/devices')
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    }, 10000)
    it(`should return 401 if refreshToken inside cookie is incorrect`, async () => {
        await request(app)
            .delete('/security/devices')
            .set('Cookie', [`refreshToken=incorrectToken`])
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    }, 10000)
    it(`should return 401 if refreshToken inside cookie is expired`, async () => {
        await createUser();
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'login12', password: 'pass123'})
            .expect(constants.HTTP_STATUS_OK)

        const loginCookies = loginResponse.headers['set-cookie']

        const refreshToken = getRefreshTokenFromCookie(loginCookies) as string;

        expect(refreshToken).not.toBeUndefined();

        const expiredToken = await getExpiredToken(refreshToken);
        await request(app)
            .delete('/security/devices')
            .set('Cookie', [`refreshToken=${expiredToken}`])
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    }, 20000)

})