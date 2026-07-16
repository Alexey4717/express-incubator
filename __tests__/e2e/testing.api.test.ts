import { setupE2eDb } from '@/../__tests__/e2e/e2e-db-lifecycle';
import { constants } from 'http2';
import request from 'supertest';

import { getEncodedAuthToken } from '@/core/helpers';

import type { CreateUserInputModel } from '@/modules/users';

import { app } from '@/app/app';

describe('/api/testing', () => {
  setupE2eDb();

  const adminBasicToken = getEncodedAuthToken();

  beforeEach(async () => {
    await request(app)
      .delete('/api/testing/all-data')
      .expect(constants.HTTP_STATUS_NO_CONTENT);
  });

  // testing clear all data api
  it('should remove all data', async () => {
    const input: CreateUserInputModel = {
      login: 'login12',
      email: 'example@gmail.com',
      password: 'pass123',
    };

    const createdUser = await request(app)
      .post('/api/users')
      .set('Authorization', `Basic ${adminBasicToken}`)
      .send(input)
      .expect(constants.HTTP_STATUS_CREATED);

    await request(app)
      .get('/api/users')
      .set('Authorization', `Basic ${adminBasicToken}`)
      .expect(constants.HTTP_STATUS_OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: [createdUser.body],
      });

    await request(app)
      .delete('/api/testing/all-data')
      .expect(constants.HTTP_STATUS_NO_CONTENT);

    await request(app)
      .get('/api/users')
      .set('Authorization', `Basic ${adminBasicToken}`)
      .expect(constants.HTTP_STATUS_OK, {
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });

    // add creating all entities types later
  });
});
