import request from "supertest";
import {MongoMemoryServer} from "mongodb-memory-server";
import {constants} from 'http2';
import {v4 as uuidv4} from 'uuid';
import {ObjectId} from "mongodb";
import jwt, {JwtPayload, VerifyErrors} from 'jsonwebtoken';

import {app} from "../../index";
import {CreateUserInputModel} from "../../models/UserModels/CreateUserInputModel";
import {GetMappedUserOutputModel} from '../../models/UserModels/GetUserOutputModel';
import {getEncodedAuthToken} from "../../helpers";
import {usersCollection} from "../../store/db";
import {settings} from "../../settings";


// прийдется запускать одиночные тесты по очереди, т.к. 429 ошибка падает
// некоторые тесты на проверку 400 отключил, т.к. слишком много запросов и возвращается 429
describe('/auth', () => {
    const adminBasicToken = getEncodedAuthToken();
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

    let mongoMemoryServer: MongoMemoryServer

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

    const invalidInputData = {
        loginOrEmail1: {password: 'pass123'},
        loginOrEmail2: {loginOrEmail: '', password: 'pass123'},
        loginOrEmail3: {loginOrEmail: ' ', password: 'pass123'},
        loginOrEmail4: {loginOrEmail: 1, password: 'pass123'},
        loginOrEmail5: {loginOrEmail: false, password: 'pass123'},

        password1: {loginOrEmail: 'login12'},
        password2: {loginOrEmail: 'login12', password: ''},
        password3: {loginOrEmail: 'login12', password: ' '},
        password4: {loginOrEmail: 'login12', password: 1},
        password5: {loginOrEmail: 'login12', password: false},
        password6: {loginOrEmail: 'login12', password: '12345'},
        password7: {loginOrEmail: 'login12', password: '123456789123456789123'},

        login1: {email: 'lehabourne@gmail.com', password: 'pass123'},
        login2: {login: '', email: 'lehabourne@gmail.com', password: 'pass123'},
        login3: {login: ' ', email: 'lehabourne@gmail.com', password: 'pass123'},
        login4: {login: 1, email: 'lehabourne@gmail.com', password: 'pass123'},
        login5: {login: false, email: 'lehabourne@gmail.com', password: 'pass123'},
        login6: {login: 'gg', email: 'lehabourne@gmail.com', password: 'pass123'},
        login7: {login: 'ggggggggggg', email: 'lehabourne@gmail.com', password: 'pass123'},
        login8: {login: ':;<.<>', email: 'lehabourne@gmail.com', password: 'pass123'},

        email1: {login: 'userLogin', password: 'pass123'},
        email2: {login: 'userLogin', email: 'notValidEmail', password: 'pass123'},
        email3: {login: 'userLogin', email: '', password: 'pass123'},
        email4: {login: 'userLogin', email: ' ', password: 'pass123'},
        email5: {login: 'userLogin', email: 1, password: 'pass123'},
        email6: {login: 'userLogin', email: false, password: 'pass123'},

        emailResending1: {},
        emailResending2: {email: 'notValidEmail'},
        emailResending3: {email: ''},
        emailResending4: {email: ' '},
        emailResending5: {email: 1},
        emailResending6: {email: false},

        code1: {},
        code2: {code: ''},
        code3: {code: ' '},
        code4: {code: 1},
        code5: {code: false},
    }

    // testing post '/auth/registration-email-resending' api
    it('should return 204 if valid input data and new confirmation code', async () => {
        await request(app)
            .post('/auth/registration')
            .send({
                login: "user2",
                email: "lehabourne@gmail.com",
                password: "pass1234"
            })
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        const response = await request(app)
            .get('/users')
            .set('Authorization', `Basic ${adminBasicToken}`)

        const userId = new ObjectId(response.body.items[0].id);

        const {emailConfirmation} = await usersCollection.findOne({_id: new ObjectId(userId)}) || {};

        const oldConfirmationCode = emailConfirmation?.confirmationCode
        expect(oldConfirmationCode).not.toBeUndefined();
        expect(emailConfirmation?.isConfirmed).not.toBeUndefined();
        expect(emailConfirmation?.isConfirmed).toBe(false);

        await request(app)
            .post('/auth/registration-email-resending')
            .send({email: 'lehabourne@gmail.com'})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        const {
            emailConfirmation: newEmailConfirmation
        } = await usersCollection.findOne({_id: new ObjectId(userId)}) || {};

        const newConfirmationCode = newEmailConfirmation?.confirmationCode
        expect(newConfirmationCode).not.toBeUndefined();
        expect(oldConfirmationCode).not.toEqual(newConfirmationCode);
    }, 10000)
    it('should return 429 if do more 5 request per 10 seconds to registration-email-resending', async () => {
        await request(app)
            .post('/auth/registration')
            .send({
                login: "user5",
                email: "lehabourne5@gmail.com",
                password: "pass1234"
            })
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        Promise.all([
            request(app)
                .post('/auth/registration-email-resending')
                .send({email: 'lehabourne5@gmail.com'})
                .expect(constants.HTTP_STATUS_NO_CONTENT),

            request(app)
                .post('/auth/registration-email-resending')
                .send({email: 'lehabourne5@gmail.com'})
                .expect(constants.HTTP_STATUS_NO_CONTENT),

            request(app)
                .post('/auth/registration-email-resending')
                .send({email: 'lehabourne5@gmail.com'})
                .expect(constants.HTTP_STATUS_NO_CONTENT),

            request(app)
                .post('/auth/registration-email-resending')
                .send({email: 'lehabourne5@gmail.com'})
                .expect(constants.HTTP_STATUS_NO_CONTENT),

            request(app)
                .post('/auth/registration-email-resending')
                .send({email: 'lehabourne5@gmail.com'})
                .expect(constants.HTTP_STATUS_NO_CONTENT),
        ]);

        await request(app)
            .post('/auth/registration-email-resending')
            .send({email: 'lehabourne5@gmail.com'})
            .expect(constants.HTTP_STATUS_TOO_MANY_REQUESTS)
    }, 10000)
    it('should return 400 if email already verified', async () => {
        const {id: userId} = await createUser({
            login: 'login12',
            email: 'lehabourne@gmail.com',
            password: 'pass123',
        }); // when user created by admin, he is already verified
        const {emailConfirmation} = await usersCollection.findOne({_id: new ObjectId(userId)}) || {};

        expect(emailConfirmation?.isConfirmed).not.toBeUndefined();
        expect(emailConfirmation?.isConfirmed).toBe(true);

        await request(app)
            .post('/auth/registration-email-resending')
            .send({email: 'lehabourne@gmail.com'})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)
    }, 10000)
    it('should return 400 if not found email', async () => {
        await request(app)
            .post('/auth/registration-email-resending')
            .send({email: 'lehabourne@gmail.com'})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)
    })
    // закомментил, т.к. нельзя делать более 5 запросов за 10 сек
    // it('should return 400 if not valid input data', async () => {
    //     await request(app)
    //         .post('/auth/registration-email-resending')
    //         .send(invalidInputData.emailResending1)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration-email-resending')
    //         .send(invalidInputData.emailResending2)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration-email-resending')
    //         .send(invalidInputData.emailResending3)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration-email-resending')
    //         .send(invalidInputData.emailResending4)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration-email-resending')
    //         .send(invalidInputData.emailResending5)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration-email-resending')
    //         .send(invalidInputData.emailResending6)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    // }, 20000)

    // testing post '/auth/registration' api
    it('should return 204 if correct input data and email or login not exists', async () => {
        await request(app)
            .post('/auth/registration')
            .send({
                login: "user2",
                email: "lehabourne@gmail.com",
                password: "pass1234"
            })
            .expect(constants.HTTP_STATUS_NO_CONTENT)
    })
    it('should return 429 if do more 5 request per 10 seconds to registration', async () => {
        Promise.all([
            request(app)
                .post('/auth/registration')
                .send({
                    login: "user1",
                    email: "lehabourne1@gmail.com",
                    password: "pass1234"
                })
                .expect(constants.HTTP_STATUS_NO_CONTENT),

            request(app)
                .post('/auth/registration')
                .send({
                    login: "user2",
                    email: "lehabourne2@gmail.com",
                    password: "pass1234"
                })
                .expect(constants.HTTP_STATUS_NO_CONTENT),

            request(app)
                .post('/auth/registration')
                .send({
                    login: "user3",
                    email: "lehabourne3@gmail.com",
                    password: "pass1234"
                })
                .expect(constants.HTTP_STATUS_NO_CONTENT),

            request(app)
                .post('/auth/registration')
                .send({
                    login: "user4",
                    email: "lehabourne4@gmail.com",
                    password: "pass1234"
                })
                .expect(constants.HTTP_STATUS_NO_CONTENT),

            request(app)
                .post('/auth/registration')
                .send({
                    login: "user5",
                    email: "lehabourne5@gmail.com",
                    password: "pass1234"
                })
                .expect(constants.HTTP_STATUS_NO_CONTENT),
        ]);

        await request(app)
            .post('/auth/registration')
            .send({
                login: "user6",
                email: "lehabourne6@gmail.com",
                password: "pass1234"
            })
            .expect(constants.HTTP_STATUS_TOO_MANY_REQUESTS)
    }, 10000)
    // it('should return 400 if not valid input data 1', async () => {
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.email1)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.email2)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.email3)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.email4)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.email5)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.email6)
    //         // .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.login1)
    //         // .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.login2)
    //         // .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.login3)
    //         // .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.login4)
    //         // .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.login5)
    //         // .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.login6)
    //         // .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.login7)
    //         // .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.login8)
    //         // .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.password1)
    //         // .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.password2)
    //         // .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.password3)
    //         // .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.password4)
    //         // .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.password5)
    //         // .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.password6)
    //         // .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(invalidInputData.password7)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    // }, 20000)
    it('should return 400 if email or login already exists', async () => {
        await request(app)
            .post('/auth/registration')
            .send({
                login: "user2",
                email: "lehabourne@gmail.com",
                password: "pass1234"
            })
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        await request(app)
            .post('/auth/registration')
            .send({
                login: "user3",
                email: "lehabourne@gmail.com",
                password: "pass1234"
            })
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/auth/registration')
            .send({
                login: "user2",
                email: "lehabourne2@gmail.com",
                password: "pass1234"
            })
            .expect(constants.HTTP_STATUS_BAD_REQUEST)
    })

    // testing post 'auth/registration-confirmation' api
    it('should return 204 if confirmation code was verified', async () => {
        await request(app)
            .post('/auth/registration')
            .send({
                login: "user2",
                email: "lehabourne@gmail.com",
                password: "pass1234"
            })
            .expect(constants.HTTP_STATUS_NO_CONTENT);

        const response = await request(app)
            .get('/users')
            .set('Authorization', `Basic ${adminBasicToken}`)

        const userId = new ObjectId(response.body.items[0].id);
        expect(ObjectId.isValid(userId)).toBe(true);

        const {emailConfirmation} = await usersCollection.findOne({_id: userId}) || {};

        expect(emailConfirmation?.confirmationCode).not.toBeUndefined();
        expect(emailConfirmation?.isConfirmed).not.toBeUndefined();
        expect(emailConfirmation?.isConfirmed).toBe(false);

        await request(app)
            .post('/auth/registration-confirmation')
            .send({code: emailConfirmation?.confirmationCode})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        const {
            emailConfirmation: confirmedEmailConfirmation
        } = await usersCollection.findOne({_id: userId}) || {};

        expect(confirmedEmailConfirmation?.isConfirmed).not.toBeUndefined();
        expect(confirmedEmailConfirmation?.isConfirmed).toBe(true);
    }, 10000)
    it('should return 429 if do more 5 request per 10 seconds to registration-confirmation', async () => {
        await request(app)
            .post('/auth/registration')
            .send({
                login: "user2",
                email: "lehabourne@gmail.com",
                password: "pass1234"
            })
            .expect(constants.HTTP_STATUS_NO_CONTENT);

        const response = await request(app)
            .get('/users')
            .set('Authorization', `Basic ${adminBasicToken}`)

        const userId = new ObjectId(response.body.items[0].id);
        expect(ObjectId.isValid(userId)).toBe(true);

        const {emailConfirmation} = await usersCollection.findOne({_id: userId}) || {};

        expect(emailConfirmation?.confirmationCode).not.toBeUndefined();
        expect(emailConfirmation?.isConfirmed).not.toBeUndefined();
        expect(emailConfirmation?.isConfirmed).toBe(false);

        Promise.all([
            request(app)
                .post('/auth/registration-confirmation')
                .send({code: emailConfirmation?.confirmationCode})
                .expect(constants.HTTP_STATUS_NO_CONTENT),

            request(app)
                .post('/auth/registration-confirmation')
                .send({code: emailConfirmation?.confirmationCode})
                .expect(constants.HTTP_STATUS_NO_CONTENT),

            request(app)
                .post('/auth/registration-confirmation')
                .send({code: emailConfirmation?.confirmationCode})
                .expect(constants.HTTP_STATUS_NO_CONTENT),

            request(app)
                .post('/auth/registration-confirmation')
                .send({code: emailConfirmation?.confirmationCode})
                .expect(constants.HTTP_STATUS_NO_CONTENT),

            request(app)
                .post('/auth/registration-confirmation')
                .send({code: emailConfirmation?.confirmationCode})
                .expect(constants.HTTP_STATUS_NO_CONTENT),
        ]);

        request(app)
            .post('/auth/registration-confirmation')
            .send({code: emailConfirmation?.confirmationCode})
            .expect(constants.HTTP_STATUS_TOO_MANY_REQUESTS)
    }, 20000)
    it('should return 400 if email already verified', async () => {
        const {id: userId} = await createUser(); // when user created by admin, he is already verified
        const {emailConfirmation} = await usersCollection.findOne({_id: new ObjectId(userId)}) || {};

        expect(emailConfirmation?.confirmationCode).not.toBeUndefined();
        expect(emailConfirmation?.isConfirmed).not.toBeUndefined();
        expect(emailConfirmation?.isConfirmed).toBe(true);

        await request(app)
            .post('/auth/registration-confirmation')
            .send({code: emailConfirmation?.confirmationCode})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)
    })
    it('should return 400 if confirmation code is expired', async () => {
        await request(app)
            .post('/auth/registration')
            .send({
                login: "user2",
                email: "lehabourne@gmail.com",
                password: "pass1234"
            })
            .expect(constants.HTTP_STATUS_NO_CONTENT);

        const response = await request(app)
            .get('/users')
            .set('Authorization', `Basic ${adminBasicToken}`)

        const userId = new ObjectId(response.body.items[0].id);
        expect(ObjectId.isValid(userId)).toBe(true);

        const {emailConfirmation} = await usersCollection.findOne({_id: userId}) || {};

        expect(emailConfirmation?.confirmationCode).not.toBeUndefined();
        expect(emailConfirmation?.isConfirmed).not.toBeUndefined();
        expect(emailConfirmation?.isConfirmed).toBe(false);
        expect(emailConfirmation?.expirationDate).not.toBeUndefined();

        const expiredDate = new Date();

        const result = await usersCollection.updateOne(
            {_id: userId},
            {$set: {'emailConfirmation.expirationDate': expiredDate}}
        );
        expect(result.modifiedCount).toBe(1);

        await request(app)
            .post('/auth/registration-confirmation')
            .send({code: emailConfirmation?.confirmationCode})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)
    })
    it('should return 400 if not exist code', async () => {
        await request(app)
            .post('/auth/registration-confirmation')
            .send({code: uuidv4()})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)
    })
    // it('should return 400 if not valid input', async () => {
    //     await request(app)
    //         .post('/auth/registration-confirmation')
    //         .send(invalidInputData.code1)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration-confirmation')
    //         .send(invalidInputData.code2)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration-confirmation')
    //         .send(invalidInputData.code3)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration-confirmation')
    //         .send(invalidInputData.code4)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/registration-confirmation')
    //         .send(invalidInputData.code5)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    // })

    // testing get '/auth/me' api
    it('should return 401 for not auth user', async () => {
        await request(app)
            .get('/auth/me')
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    })
    it('should return 401 if accessToken is expired', async () => {
        await createUser();
        const authData = await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'example@gmail.com', password: 'pass123'})
            .expect(constants.HTTP_STATUS_OK)

        const {accessToken} = authData?.body || {};
        const expiredToken = await getExpiredToken(accessToken);

        await request(app)
            .get('/auth/me')
            .set('Authorization', `Bearer ${expiredToken}`)
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    })
    it(
        'should return 200 and access token of current auth user if loginOrEmail and password are correct',
        async () => {
            const createdUser = await createUser();
            const authData = await request(app)
                .post('/auth/login')
                .send({loginOrEmail: 'example@gmail.com', password: 'pass123'})
                .expect(constants.HTTP_STATUS_OK)

            const {accessToken} = authData?.body || {};

            await request(app)
                .get('/auth/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(
                    constants.HTTP_STATUS_OK,
                    {
                        email: createdUser.email,
                        login: createdUser.login,
                        userId: createdUser.id,
                    }
                )
        }, 10000)

    // testing post '/auth/login' api
    it(`should return 401 if the password or login is wrong`, async () => {
        await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'login12', password: 'pass123'})
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)

        await createUser();

        await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'login123', password: 'pass123'})
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)

        await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'login12', password: 'pass1234'})
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)

        await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'example2@gmail.com', password: 'pass1234'})
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    }, 20000)
    it('should return 429 if do more 5 request per 10 seconds to login', async () => {
        await createUser();

        Promise.all([
            request(app)
                .post('/auth/login')
                .send({loginOrEmail: 'example@gmail.com', password: 'pass123'})
                .expect(constants.HTTP_STATUS_OK),

            request(app)
                .post('/auth/login')
                .send({loginOrEmail: 'example@gmail.com', password: 'pass123'})
                .expect(constants.HTTP_STATUS_OK),

            request(app)
                .post('/auth/login')
                .send({loginOrEmail: 'example@gmail.com', password: 'pass123'})
                .expect(constants.HTTP_STATUS_OK),

            request(app)
                .post('/auth/login')
                .send({loginOrEmail: 'example@gmail.com', password: 'pass123'})
                .expect(constants.HTTP_STATUS_OK),

            request(app)
                .post('/auth/login')
                .send({loginOrEmail: 'example@gmail.com', password: 'pass123'})
                .expect(constants.HTTP_STATUS_OK),
        ]);

        await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'example@gmail.com', password: 'pass123'})
            .expect(constants.HTTP_STATUS_TOO_MANY_REQUESTS)
    }, 10000)
    // it(`shouldn't login with incorrect input data`, async () => {
    //     await createUser();
    //
    //     await request(app)
    //         .post('/auth/login')
    //         .send(invalidInputData.loginOrEmail1)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/login')
    //         .send(invalidInputData.loginOrEmail2)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/login')
    //         .send(invalidInputData.loginOrEmail3)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/login')
    //         .send(invalidInputData.loginOrEmail4)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/login')
    //         .send(invalidInputData.loginOrEmail5)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/login')
    //         .send(invalidInputData.password1)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/login')
    //         .send(invalidInputData.password2)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/login')
    //         .send(invalidInputData.password3)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/login')
    //         .send(invalidInputData.password4)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    //
    //     await request(app)
    //         .post('/auth/login')
    //         .send(invalidInputData.password5)
    //         .expect(constants.HTTP_STATUS_BAD_REQUEST)
    // })
    it(`should return 200, accessToken in body and refreshToken with cookie if correct input data`, async () => {
        await createUser();
        const response = await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'example@gmail.com', password: 'pass123'})
            .expect(constants.HTTP_STATUS_OK)

        const cookies = response.headers['set-cookie']

        const accessToken = response?.body?.accessToken;
        const refreshToken = getRefreshTokenFromCookie(cookies);

        expect(accessToken).not.toBeUndefined();
        expect(refreshToken).not.toBeUndefined();
    })

    // testing post '/auth/refresh-token' api
    it(`should return 200, accessToken in body and refreshToken with cookie`, async () => {
        await createUser();
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'login12', password: 'pass123'})
            .expect(constants.HTTP_STATUS_OK)

        const loginCookies = loginResponse.headers['set-cookie']

        const accessToken1 = loginResponse?.body?.accessToken;
        const refreshToken1 = getRefreshTokenFromCookie(loginCookies);

        const refreshResponse = await request(app)
            .post('/auth/refresh-token')
            .set('Cookie', [`refreshToken=${refreshToken1}`])
            .expect(constants.HTTP_STATUS_OK)

        const refreshCookies = refreshResponse.headers['set-cookie']

        const accessToken2 = refreshResponse?.body?.accessToken;
        const refreshToken2 = getRefreshTokenFromCookie(refreshCookies);

        expect(accessToken2).not.toBeUndefined();
        expect(refreshToken2).not.toBeUndefined();

        expect(accessToken1 === accessToken2).not.toBeTruthy();
        expect(refreshToken1 === refreshToken2).not.toBeTruthy();
    }, 20000)
    it(`should return 401 if refreshToken inside cookie is missing`, async () => {
        await request(app)
            .post('/auth/refresh-token')
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    }, 10000)
    it(`should return 401 if refreshToken inside cookie is incorrect`, async () => {
        await request(app)
            .post('/auth/refresh-token')
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
            .post('/auth/refresh-token')
            .set('Cookie', [`refreshToken=${expiredToken}`])
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    }, 20000)

    // testing post '/auth/password-recovery' api
    it(`should return 204 if valid email`, async () => {
        await request(app)
            .post('/auth/password-recovery')
            .send({email: 'lehabourne@gmail.com'})
            .expect(constants.HTTP_STATUS_NO_CONTENT)
    })
    it(`should return 400 if invalid email`, async () => {
        await request(app)
            .post('/auth/password-recovery')
            .send({email: '222^gmail.com'})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)
    })
    it('should return 429 if do more 5 request per 10 seconds to password-recovery', async () => {
        Promise.all([
            request(app)
                .post('/auth/password-recovery')
                .send({email: 'lehabourne444@gmail.com'})
                .expect(constants.HTTP_STATUS_NO_CONTENT),

            request(app)
                .post('/auth/password-recovery')
                .send({email: 'lehabourne444@gmail.com'})
                .expect(constants.HTTP_STATUS_NO_CONTENT),

            request(app)
                .post('/auth/password-recovery')
                .send({email: 'lehabourne444@gmail.com'})
                .expect(constants.HTTP_STATUS_NO_CONTENT),

            request(app)
                .post('/auth/password-recovery')
                .send({email: 'lehabourne444@gmail.com'})
                .expect(constants.HTTP_STATUS_NO_CONTENT),

            request(app)
                .post('/auth/password-recovery')
                .send({email: 'lehabourne444@gmail.com'})
                .expect(constants.HTTP_STATUS_NO_CONTENT),
        ]);

        request(app)
            .post('/auth/password-recovery')
            .send({email: 'lehabourne444@gmail.com'})
            .expect(constants.HTTP_STATUS_TOO_MANY_REQUESTS)
    }, 10000)

    // testing post '/auth/new-password' api
    it(`should return 204 for new-password if valid email and login with new password`, async () => {
        const response = await createUser();

        const userId = new ObjectId(response.id);
        expect(ObjectId.isValid(userId)).toBe(true);

        await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'login12', password: 'pass123'})
            .expect(constants.HTTP_STATUS_OK)

        await request(app)
            .post('/auth/password-recovery')
            .send({email: 'example@gmail.com'})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        const {recoveryData} = await usersCollection.findOne({_id: userId}) || {};
        expect(recoveryData?.recoveryCode).not.toBeUndefined();

        await request(app)
            .post('/auth/new-password')
            .send({newPassword: 'qwerty123', recoveryCode: recoveryData?.recoveryCode})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'login12', password: 'pass123'})
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)

        await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'login12', password: 'qwerty123'})
            .expect(constants.HTTP_STATUS_OK)
    }, 10000)
    it(`should return 400 if invalid password`, async () => {
        const response = await createUser();

        const userId = new ObjectId(response.id);
        expect(ObjectId.isValid(userId)).toBe(true);

        await request(app)
            .post('/auth/password-recovery')
            .send({email: 'example@gmail.com'})
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        const {recoveryData} = await usersCollection.findOne({_id: userId}) || {};
        expect(recoveryData?.recoveryCode).not.toBeUndefined();

        await request(app)
            .post('/auth/new-password')
            .send({newPassword: '123', recoveryCode: recoveryData?.recoveryCode})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)
    }, 10000)
    it('should return 400 if not exist code', async () => {
        await request(app)
            .post('/auth/new-password')
            .send({newPassword: '123rtyhge', recoveryCode: uuidv4()})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)
    })
    it('should return 400 if invalid code', async () => {
        await request(app)
            .post('/auth/new-password')
            .send({newPassword: 'validvalid', recoveryCode: "incorrect"})
            .expect(constants.HTTP_STATUS_BAD_REQUEST)
    })
    it('should return 429 if do more 5 request per 10 seconds to password-recovery', async () => {
        Promise.all([
            request(app)
                .post('/auth/new-password')
                .send({newPassword: '123rtyhge', recoveryCode: uuidv4()})
                .expect(constants.HTTP_STATUS_BAD_REQUEST),

            request(app)
                .post('/auth/new-password')
                .send({newPassword: '123rtyhge', recoveryCode: uuidv4()})
                .expect(constants.HTTP_STATUS_BAD_REQUEST),

            request(app)
                .post('/auth/new-password')
                .send({newPassword: '123rtyhge', recoveryCode: uuidv4()})
                .expect(constants.HTTP_STATUS_BAD_REQUEST),

            request(app)
                .post('/auth/new-password')
                .send({newPassword: '123rtyhge', recoveryCode: uuidv4()})
                .expect(constants.HTTP_STATUS_BAD_REQUEST),

            request(app)
                .post('/auth/new-password')
                .send({newPassword: '123rtyhge', recoveryCode: uuidv4()})
                .expect(constants.HTTP_STATUS_BAD_REQUEST),
        ]);

        request(app)
            .post('/auth/new-password')
            .send({newPassword: '123rtyhge', recoveryCode: uuidv4()})
            .expect(constants.HTTP_STATUS_TOO_MANY_REQUESTS)
    }, 10000)

    // testing post '/auth/logout' api
    it(`should return 204 if correct refreshToken in cookie`, async () => {
        await createUser();
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'login12', password: 'pass123'})
            .expect(constants.HTTP_STATUS_OK)

        const loginCookies = loginResponse.headers['set-cookie']

        const refreshToken = getRefreshTokenFromCookie(loginCookies);

        expect(refreshToken).not.toBeUndefined();

        await request(app)
            .post('/auth/logout')
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(constants.HTTP_STATUS_NO_CONTENT);
    }, 20000)
    it(`should return 401 if refreshToken inside cookie is missing`, async () => {
        await request(app)
            .post('/auth/logout')
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    }, 10000)
    it(`should return 401 if refreshToken inside cookie is incorrect`, async () => {
        await request(app)
            .post('/auth/logout')
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
            .post('/auth/logout')
            .set('Cookie', [`refreshToken=${expiredToken}`])
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    }, 20000)
    it(`after logout refreshToken should be not valid for refreshing`, async () => {
        await createUser();
        const loginResponse = await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'login12', password: 'pass123'})
            .expect(constants.HTTP_STATUS_OK)

        const loginCookies = loginResponse.headers['set-cookie']

        const refreshToken = getRefreshTokenFromCookie(loginCookies) as string;

        expect(refreshToken).not.toBeUndefined();

        await request(app)
            .post('/auth/logout')
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(constants.HTTP_STATUS_NO_CONTENT)

        await request(app)
            .post('/auth/refresh-token')
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    }, 20000)

});
