import {videosCollection} from '../../store/db';
import {GetVideoOutputModel} from "../../models/VideoModels/GetVideoOutputModel";
import {UpdateVideoInputModel} from "../../models/VideoModels/UpdateVideoInputModel";
import {ObjectId} from "mongodb";
import VideoModel from "../../models/VideoModels/Video-model";

interface UpdateVideoArgs {
    id: string
    input: UpdateVideoInputModel
}

export class VideosRepository {
    async createVideo(newVideo: GetVideoOutputModel): Promise<boolean> {
        try {
            // const result =  await videosCollection.insertOne(newVideo);
            await VideoModel.create(newVideo);
            // or insertMany([newVideo])
            return true;
        } catch (error) {
            console.log(`VideosRepository create video error is occurred: ${error}`)
            return false;
        }
    }

    async updateVideo({id, input}: UpdateVideoArgs): Promise<boolean> {
        try {
            // const result = await videosCollection.updateOne(
            //     {"_id": new ObjectId(id)},
            //     {$set: input}
            // )
            const result = await VideoModel.updateOne(
                {"_id": new ObjectId(id)},
                {$set: input}
            )
            return result?.matchedCount === 1;
        } catch (error) {
            console.log(`VideosRepository update video error is occurred: ${error}`)
            return false;
        }
    }

    async deleteVideoById(id: string): Promise<boolean> {
        try {
            // const result = await videosCollection.deleteOne({"_id" : new ObjectId(id)});
            const result = await VideoModel.deleteOne({"_id" : new ObjectId(id)});
            return result.deletedCount === 1;
        } catch (error) {
            console.log(`VideosRepository delete video error is occurred: ${error}`)
            return false;
        }
    }
};
