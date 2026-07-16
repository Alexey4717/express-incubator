import {Request, Response} from "express";
import {constants} from "http2";

import {db} from "../store/mockedDB";
import {
    blogsCollection,
    // commentsCollection,
    // postsCollection,
    securityDevicesCollection,
    usersCollection,
    // videosCollection
} from "../store/db";
import VideoModel from "../models/VideoModels/Video-model";
import CommentModel from "../models/CommentsModels/Comment-model";
import PostModel from "../models/PostModels/Post-model";


export const testingControllers = {
    async deleteAllData(
        req: Request,
        res: Response<void>
    ) {
        // deleting from mocked DB
        for (let property in db) {
            if (property.toString() !== 'users') {
                (db as any)[property] = [];
            }
        }

        // deleting from mongodb atlas
        await Promise.all([
            blogsCollection.deleteMany({}),
            PostModel.deleteMany({}),
            // videosCollection.deleteMany({}),
            VideoModel.deleteMany({}),
            usersCollection.deleteMany({}),
            // commentsCollection.deleteMany({}),
            CommentModel.deleteMany({}),
            securityDevicesCollection.deleteMany({}),
        ]);

        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
    }
};
