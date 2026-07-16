import { constants } from 'http2';
import request from 'supertest';

import { app } from '../../src/app/app';
import { AvailableResolutions } from '../../src/core/types/common';
import { CreateVideoInputModel } from '../../src/modules/videos/models/VideoModels/CreateVideoInputModel';
import { GetMappedVideoOutputModel } from '../../src/modules/videos/models/VideoModels/GetVideoOutputModel';
import { UpdateVideoInputModel } from '../../src/modules/videos/models/VideoModels/UpdateVideoInputModel';
import { setupE2eDb } from './e2e-db-lifecycle';

describe('/video', () => {
  setupE2eDb();

  beforeEach(async () => {
    await request(app)
      .delete('/api/testing/all-data')
      .expect(constants.HTTP_STATUS_NO_CONTENT);
  });

  const notExistingId = '63cde53de1eeeb34059bda94'; // valid format
  const invalidInputData = {
    title1: {
      title: '',
      author: 'author',
      availableResolutions: [AvailableResolutions.P144],
    },
    title2: {
      title: ' ',
      author: 'author',
      availableResolutions: [AvailableResolutions.P144],
    },
    title3: {
      title: 1,
      author: 'author',
      availableResolutions: [AvailableResolutions.P144],
    },
    title4: {
      title: 'Lorem ipsum dolor sit amet, consectetuer.',
      author: 'author',
      availableResolutions: [AvailableResolutions.P144],
    },

    author1: {
      title: 'title',
      author: '',
      availableResolutions: [AvailableResolutions.P144],
    },
    author2: {
      title: 'title',
      author: ' ',
      availableResolutions: [AvailableResolutions.P144],
    },
    author3: {
      title: 'title',
      author: 1,
      availableResolutions: [AvailableResolutions.P144],
    },
    author4: {
      title: 'title',
      author: 'Lorem ipsum dolor sit',
      availableResolutions: [AvailableResolutions.P144],
    },

    availableResolutions1: {
      title: 'title',
      author: 'author',
      availableResolutions: [],
    },
    availableResolutions2: {
      title: 'title',
      author: 'author',
      availableResolutions: ['P1444'],
    },
    availableResolutions3: {
      title: 'title',
      author: 'author',
      availableResolutions: ['P144', 'Invalid', 'P720'],
    },

    // canBeDownloaded, minAgeRestriction, publicationDate check only for update video (put method)
    canBeDownloaded1: {
      title: 'title',
      author: 'author',
      availableResolutions: [AvailableResolutions.P144],
      canBeDownloaded: 1,
    },
    canBeDownloaded2: {
      title: 'title',
      author: 'author',
      availableResolutions: [AvailableResolutions.P144],
      canBeDownloaded: 'string',
    },

    minAgeRestriction1: {
      title: 'title',
      author: 'author',
      availableResolutions: [AvailableResolutions.P144],
      minAgeRestriction: 'dfgdfg',
    },
    minAgeRestriction2: {
      title: 'title',
      author: 'author',
      availableResolutions: [AvailableResolutions.P144],
      minAgeRestriction: 0,
    },
    minAgeRestriction3: {
      title: 'title',
      author: 'author',
      availableResolutions: [AvailableResolutions.P144],
      minAgeRestriction: 19,
    },

    publicationDate1: {
      title: 'title',
      author: 'author',
      availableResolutions: [AvailableResolutions.P144],
      publicationDate: 1,
    },
    publicationDate2: {
      title: 'title',
      author: 'author',
      availableResolutions: [AvailableResolutions.P144],
      publicationDate: 'invalidDateString',
    },
  };

  // testing clear all data api
  it('should remove all data', async () => {
    await request(app)
      .delete('/api/testing/all-data')
      .expect(constants.HTTP_STATUS_NO_CONTENT);
  });

  // testing get '/api/videos' api
  it('should return 200 and empty array', async () => {
    await request(app).get('/api/videos').expect(constants.HTTP_STATUS_OK, []);
  });

  it('should return 200 and array of videos', async () => {
    const data1: CreateVideoInputModel = {
      title: 'title',
      author: 'author',
      availableResolutions: ['P144' as AvailableResolutions],
    };
    const createResponse1 = await request(app)
      .post('/api/videos')
      .send(data1)
      .expect(constants.HTTP_STATUS_CREATED);

    const createdVideo1: GetMappedVideoOutputModel = createResponse1?.body;

    await request(app)
      .get('/api/videos')
      .expect(constants.HTTP_STATUS_OK, [createdVideo1]);

    const data2: CreateVideoInputModel = {
      title: 'title',
      author: 'author',
      availableResolutions: ['P144' as AvailableResolutions],
    };
    const createResponse2 = await request(app)
      .post('/api/videos')
      .send(data2)
      .expect(constants.HTTP_STATUS_CREATED);

    const createdVideo2: GetMappedVideoOutputModel = createResponse2?.body;

    await request(app)
      .get('/api/videos')
      .expect(constants.HTTP_STATUS_OK, [createdVideo1, createdVideo2]);
  });

  // testing get '/api/videos/:id' api
  it('should return 404 for not existing video', async () => {
    await request(app)
      .get(`/api/videos/${notExistingId}`)
      .expect(constants.HTTP_STATUS_NOT_FOUND);
  });
  it('should return 200 and existing video', async () => {
    const data: CreateVideoInputModel = {
      title: 'title',
      author: 'author',
      availableResolutions: [AvailableResolutions.P144],
    };
    const createResponse = await request(app)
      .post('/api/videos')
      .send(data)
      .expect(constants.HTTP_STATUS_CREATED);

    const createdVideo: GetMappedVideoOutputModel = createResponse?.body;
    await request(app)
      .get(`/api/videos/${createdVideo.id}`)
      .expect(constants.HTTP_STATUS_OK, createdVideo);
  });

  // testing delete '/api/videos/:id' api
  it('should return 404 for not existing video', async () => {
    await request(app)
      .delete('/api/videos/63cde53de1eeeb34059bda94')
      .expect(constants.HTTP_STATUS_NOT_FOUND);
  });
  it('should return 204 for existing video', async () => {
    const data: CreateVideoInputModel = {
      title: 'title',
      author: 'author',
      availableResolutions: [AvailableResolutions.P144],
    };
    const createResponse = await request(app)
      .post('/api/videos')
      .send(data)
      .expect(constants.HTTP_STATUS_CREATED);

    const createdVideo: GetMappedVideoOutputModel = createResponse?.body;
    await request(app)
      .delete(`/api/videos/${createdVideo.id}`)
      .expect(constants.HTTP_STATUS_NO_CONTENT);
  });

  // testing post '/api/videos' api
  it(`shouldn't create video with incorrect input data`, async () => {
    await request(app)
      .post('/api/videos')
      .send(invalidInputData.title1)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .post('/api/videos')
      .send(invalidInputData.title2)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .post('/api/videos')
      .send(invalidInputData.title3)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .post('/api/videos')
      .send(invalidInputData.title4)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .post('/api/videos')
      .send(invalidInputData.author1)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .post('/api/videos')
      .send(invalidInputData.author2)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .post('/api/videos')
      .send(invalidInputData.author3)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .post('/api/videos')
      .send(invalidInputData.availableResolutions1)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .post('/api/videos')
      .send(invalidInputData.availableResolutions2)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .post('/api/videos')
      .send(invalidInputData.availableResolutions3)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app).get('/api/videos').expect(constants.HTTP_STATUS_OK, []);
  });
  it(`should create video with correct input data`, async () => {
    const data: CreateVideoInputModel = {
      title: 'title',
      author: 'author',
      availableResolutions: [AvailableResolutions.P144],
    };
    const createResponse = await request(app)
      .post('/api/videos')
      .send(data)
      .expect(constants.HTTP_STATUS_CREATED);

    const createdVideo: GetMappedVideoOutputModel = createResponse?.body;
    const expectedVideo: GetMappedVideoOutputModel = {
      ...data,
      id: createdVideo.id,
      canBeDownloaded: false,
      minAgeRestriction: null,
      createdAt: createdVideo.createdAt,
      publicationDate: new Date(
        new Date(createdVideo.createdAt).setDate(
          new Date(createdVideo.createdAt).getDate() + 1,
        ),
      ).toISOString(),
    };

    expect(createdVideo).toEqual(expectedVideo);

    await request(app)
      .get('/api/videos')
      .expect(constants.HTTP_STATUS_OK, [createdVideo]);
  });

  // testing put '/api/videos/:id' api
  it(`shouldn't update video with incorrect input data`, async () => {
    const data: CreateVideoInputModel = {
      title: 'title',
      author: 'author',
      availableResolutions: [AvailableResolutions.P144],
    };
    const createResponse = await request(app)
      .post('/api/videos')
      .send(data)
      .expect(constants.HTTP_STATUS_CREATED);

    const createdVideo = createResponse?.body;

    await request(app)
      .put(`/api/videos/${createdVideo?.id}`)
      .send(invalidInputData.title1)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/videos/${createdVideo?.id}`)
      .send(invalidInputData.title2)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/videos/${createdVideo?.id}`)
      .send(invalidInputData.title3)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/videos/${createdVideo?.id}`)
      .send(invalidInputData.title4)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/videos/${createdVideo?.id}`)
      .send(invalidInputData.author1)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/videos/${createdVideo?.id}`)
      .send(invalidInputData.author2)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/videos/${createdVideo?.id}`)
      .send(invalidInputData.author3)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/videos/${createdVideo?.id}`)
      .send(invalidInputData.availableResolutions1)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/videos/${createdVideo?.id}`)
      .send(invalidInputData.availableResolutions2)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/videos/${createdVideo?.id}`)
      .send(invalidInputData.availableResolutions3)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/videos/${createdVideo?.id}`)
      .send(invalidInputData.canBeDownloaded1)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/videos/${createdVideo?.id}`)
      .send(invalidInputData.canBeDownloaded2)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/videos/${createdVideo?.id}`)
      .send(invalidInputData.minAgeRestriction1)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/videos/${createdVideo?.id}`)
      .send(invalidInputData.minAgeRestriction2)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/videos/${createdVideo?.id}`)
      .send(invalidInputData.minAgeRestriction3)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/videos/${createdVideo?.id}`)
      .send(invalidInputData.publicationDate1)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .put(`/api/videos/${createdVideo?.id}`)
      .send(invalidInputData.publicationDate2)
      .expect(constants.HTTP_STATUS_BAD_REQUEST);

    await request(app)
      .get('/api/videos')
      .expect(constants.HTTP_STATUS_OK, [createdVideo]);
  });
  it(`shouldn't update video if not exist`, async () => {
    const data: UpdateVideoInputModel = {
      title: 'title1',
      author: 'author2',
      availableResolutions: [AvailableResolutions.P240],
    };
    await request(app)
      .put('/api/videos/63cde53de1eeeb34059bda94')
      .send(data)
      .expect(constants.HTTP_STATUS_NOT_FOUND);

    await request(app).get('/api/videos').expect(constants.HTTP_STATUS_OK, []);
  });
  it(`should update video with correct input data`, async () => {
    const dataForCreate: CreateVideoInputModel = {
      title: 'title',
      author: 'author',
      availableResolutions: [AvailableResolutions.P240],
    };
    const dataForUpdate: UpdateVideoInputModel = {
      title: 'title1',
      author: 'author2',
      availableResolutions: [AvailableResolutions.P144],
    };

    const createResponse = await request(app)
      .post('/api/videos')
      .send(dataForCreate)
      .expect(constants.HTTP_STATUS_CREATED);

    const createdVideo = createResponse.body;

    await request(app)
      .put(`/api/videos/${createdVideo?.id}`)
      .send(dataForUpdate)
      .expect(constants.HTTP_STATUS_NO_CONTENT);

    const updatedVideo = { ...createdVideo, ...dataForUpdate };

    await request(app)
      .get('/api/videos')
      .expect(constants.HTTP_STATUS_OK, [updatedVideo]);
  });
});
