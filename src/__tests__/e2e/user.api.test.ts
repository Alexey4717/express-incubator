import request from "supertest";
import {MongoMemoryServer} from "mongodb-memory-server";
import {constants} from 'http2';

import {app} from "../../index";
import {CreateUserInputModel} from "../../models/UserModels/CreateUserInputModel";
import {GetMappedUserOutputModel} from '../../models/UserModels/GetUserOutputModel';
import {getEncodedAuthToken} from "../../helpers";


describe('/user', () => {
    const encodedBase64Token = getEncodedAuthToken();
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
    })

    const notExistingId = '63cde53de1eeeb34059bda94'; // valid format
    const invalidInputData = {
        login1: {email: 'example@gmail.com', password: 'pass123'},
        login2: {login: '', email: 'example@gmail.com', password: 'pass123'},
        login3: {login: ' ', email: 'example@gmail.com', password: 'pass123'},
        login4: {login: 1, email: 'example@gmail.com', password: 'pass123'},
        login5: {login: false, email: 'example@gmail.com', password: 'pass123'},
        login6: {login: 'ff', email: 'example@gmail.com', password: 'pass123'},
        login7: {login: 'fffffffffff', email: 'example@gmail.com', password: 'pass123'},

        email1: {login: 'login123', password: 'pass123'},
        email2: {login: 'login123', email: '', password: 'pass123'},
        email3: {login: 'login123', email: ' ', password: 'pass123'},
        email4: {login: 'login123', email: 1, password: 'pass123'},
        email5: {login: 'login123', email: false, password: 'pass123'},
        email6: {login: 'login123', email: 'examplegmail.com', password: 'pass123'},
        email7: {login: 'login123', email: 'example@gmailcom', password: 'pass123'},

        password1: {login: 'login123', email: 'example@gmail.com'},
        password2: {login: 'login123', email: 'example@gmail.com', password: ''},
        password3: {login: 'login123', email: 'example@gmail.com', password: ' '},
        password4: {login: 'login123', email: 'example@gmail.com', password: 1},
        password5: {login: 'login123', email: 'example@gmail.com', password: false},
        password6: {login: 'login123', email: 'example@gmail.com', password: 'fffff'},
        password7: {login: 'login123', email: 'example@gmail.com', password: 'fffffffffffffffffffff'},
    }

    // testing get '/users' api
    it('should return 401 for not auth user', async () => {
        await request(app)
            .get('/users')
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    })
    it('should return 200 and empty array', async () => {
        await request(app)
            .get('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            })
    })
    it('should return 200 and array of users', async () => {
        const input1: CreateUserInputModel = {
            login: 'login1',
            email: 'example1@gmail.com',
            password: 'pass123',
        };
        const createdUser1 = await createUser(input1);

        await request(app)
            .get('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [createdUser1]
            });

        const input2: CreateUserInputModel = {
            login: 'login2',
            email: 'example2@gmail.com',
            password: 'pass123',
        };
        const createdUser2 = await createUser(input2);

        await request(app)
            .get('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [createdUser2, createdUser1]
            });
    })
    it('should return 200 and array of users sorted by specified field with sortDirection', async () => {
        const input1: CreateUserInputModel = {
            login: 'Zed123',
            email: 'example1@gmail.com',
            password: 'pass123',
        };
        const createdUser1 = await createUser(input1);

        const input2: CreateUserInputModel = {
            login: 'Bob234',
            email: 'example2@gmail.com',
            password: 'pass123',
        };
        const createdUser2 = await createUser(input2);

        const input3: CreateUserInputModel = {
            login: 'Alex12',
            email: 'example3@gmail.com',
            password: 'pass123',
        };
        const createdUser3 = await createUser(input3);

        const input4: CreateUserInputModel = {
            login: 'Den123',
            email: 'example4@gmail.com',
            password: 'pass123',
        };
        const createdUser4 = await createUser(input4);

        await request(app)
            .get('/users?sortBy=login')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 4,
                items: [createdUser1, createdUser4, createdUser2, createdUser3]
            });

        await request(app)
            .get('/users?sortBy=email&sortDirection=asc')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 4,
                items: [createdUser1, createdUser2, createdUser3, createdUser4]
            });
    })
    it('should return 200 and array of users filtered by searchLoginTerm or (and) searchEmailTerm', async () => {
        const input1: CreateUserInputModel = {
            login: 'Dimych',
            email: 'dimych@gmail.com',
            password: 'pass123',
        };
        const createdUser1 = await createUser(input1);

        const input2: CreateUserInputModel = {
            login: 'Nanalia',
            email: 'kuzyuberdina@gmail.com',
            password: 'pass123',
        };
        const createdUser2 = await createUser(input2);

        const input3: CreateUserInputModel = {
            login: 'Alex12',
            email: 'example3@gmail.com',
            password: 'pass123',
        };
        const createdUser3 = await createUser(input3);

        const input4: CreateUserInputModel = {
            login: 'Bob123',
            email: 'example4@gmail.com',
            password: 'pass123',
        };
        const createdUser4 = await createUser(input4);

        await request(app)
            .get('/users?searchLoginTerm=D')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [createdUser1]
            });

        await request(app)
            .get('/users?searchEmailTerm=K')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [createdUser2]
            });

        // Возможно некорректный кейс
        await request(app)
            .get('/users?searchLoginTerm=D&searchEmailTerm=K')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [createdUser2, createdUser1]
            });
    })
    it('should return 200 and portion array of users with page number and size', async () => {
        const input1: CreateUserInputModel = {
            login: 'Zed123',
            email: 'example1@gmail.com',
            password: 'pass123',
        };
        const createdUser1 = await createUser(input1);

        const input2: CreateUserInputModel = {
            login: 'Bob234',
            email: 'example2@gmail.com',
            password: 'pass123',
        };
        const createdUser2 = await createUser(input2);

        const input3: CreateUserInputModel = {
            login: 'Alex12',
            email: 'example3@gmail.com',
            password: 'pass123',
        };
        const createdUser3 = await createUser(input3);

        const input4: CreateUserInputModel = {
            login: 'Den123',
            email: 'example4@gmail.com',
            password: 'pass123',
        };
        const createdUser4 = await createUser(input4);

        const input5: CreateUserInputModel = {
            login: 'Maria12',
            email: 'example5@gmail.com',
            password: 'pass123',
        };
        const createdUser5 = await createUser(input5);

        const input6: CreateUserInputModel = {
            login: 'Julia123',
            email: 'example6@gmail.com',
            password: 'pass123',
        };
        const createdUser6 = await createUser(input6);

        await request(app)
            .get('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .expect(
                constants.HTTP_STATUS_OK,
                {
                    pagesCount: 1,
                    page: 1,
                    pageSize: 10,
                    totalCount: 6,
                    items: [createdUser6, createdUser5, createdUser4, createdUser3, createdUser2, createdUser1]
                }
            );

        await request(app)
            .get('/users?pageSize=4')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 2,
                page: 1,
                pageSize: 4,
                totalCount: 6,
                items: [createdUser6, createdUser5, createdUser4, createdUser3]
            });

        await request(app)
            .get('/users?pageNumber=2&pageSize=2')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 3,
                page: 2,
                pageSize: 2,
                totalCount: 6,
                items: [createdUser4, createdUser3]
            });
    })

    // testing delete '/users/:id' api
    it('should return 401 for not auth user', async () => {
        await request(app)
            .delete(`/users/${notExistingId}`)
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)
    })
    it('should return 404 for not existing user', async () => {
        await request(app)
            .delete(`/users/${notExistingId}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .expect(constants.HTTP_STATUS_NOT_FOUND)
    })
    it('should return 204 for existing user', async () => {
        const createdUser = await createUser();
        await request(app)
            .delete(`/users/${createdUser?.id}`)
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .expect(constants.HTTP_STATUS_NO_CONTENT)
    })

    // testing post '/users' api
    it(`shouldn't create user if not auth user`, async () => {
        const input: CreateUserInputModel = {
            login: 'Zed123',
            email: 'example1@gmail.com',
            password: 'pass123',
        };
        await request(app)
            .post('/users')
            .send(input)
            .expect(constants.HTTP_STATUS_UNAUTHORIZED)

        await request(app)
            .get('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            })
    })
    it(`shouldn't create user with incorrect input data`, async () => {
        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.login1)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.login2)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.login3)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.login4)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.login5)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.login6)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.login7)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.email1)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.email2)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.email3)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.email4)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.email5)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.email6)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.email7)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.password1)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.password2)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.password3)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.password4)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.password5)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.password6)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(invalidInputData.password7)
            .expect(constants.HTTP_STATUS_BAD_REQUEST)

        await request(app)
            .get('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 0,
                page: 1,
                pageSize: 10,
                totalCount: 0,
                items: []
            })
    })
    it(`should create user with correct input data`, async () => {
        const input: CreateUserInputModel = {
            login: 'Zed123',
            email: 'example1@gmail.com',
            password: 'pass123',
        };
        const createResponse = await request(app)
            .post('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .send(input)
            .expect(constants.HTTP_STATUS_CREATED)

        const createdUser: GetMappedUserOutputModel = createResponse?.body;
        const expectedUser: GetMappedUserOutputModel = {
            id: createdUser?.id,
            login: input.login,
            email: input.email,
            createdAt: createdUser.createdAt
        };

        expect(createdUser).toEqual(expectedUser);

        await request(app)
            .get('/users')
            .set('Authorization', `Basic ${encodedBase64Token}`)
            .expect(constants.HTTP_STATUS_OK, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [createdUser]
            })
    })

});