import { MongoClient, ServerApiVersion } from 'mongodb';
import mongoose from 'mongoose';

import { GetBlogOutputModel } from '../models/BlogModels/GetBlogOutputModel';
import { GetPostOutputModel } from '../models/PostModels/GetPostOutputModel';
import { GetVideoOutputModel } from '../models/VideoModels/GetVideoOutputModel';
import { GetUserOutputModel } from '../models/UserModels/GetUserOutputModel';
import { settings } from '../settings';
import { GetCommentOutputModel } from '../models/CommentsModels/GetCommentOutputModel';
import { GetSecurityDeviceOutputModel } from '../models/SecurityDeviceModels/GetSecurityDeviceOutputModel';

const mongoUri = settings.MONGO_URI;
const dbName = settings.DB_NAME;

const client = new MongoClient(mongoUri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

const db01 = client.db(dbName);

export const usersCollection = db01.collection<GetUserOutputModel>('users');
export const blogsCollection = db01.collection<GetBlogOutputModel>('blogs');
export const postsCollection = db01.collection<GetPostOutputModel>('posts');
export const videosCollection = db01.collection<GetVideoOutputModel>('videos');
export const commentsCollection = db01.collection<GetCommentOutputModel>('comments');
export const securityDevicesCollection = db01.collection<GetSecurityDeviceOutputModel>('security-devices');

export const runDB = async () => {
    try {
        console.log('mongoUri: ', mongoUri);
        await client.connect();
        await mongoose.connect(mongoUri);
        await client.db('admin').command({ ping: 1 });
        console.log('Connected successfully to mongo server');
    } catch (error) {
        console.error('Error connection to mongodb is occurred: ', error);
        await client.close();
        await mongoose.disconnect();
    }
};
