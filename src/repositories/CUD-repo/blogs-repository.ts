import {ObjectId} from "mongodb";

import {blogsCollection} from '../../store/db';
import {GetBlogOutputModel} from "../../models/BlogModels/GetBlogOutputModel";
import {UpdateBlogInputModel} from "../../models/BlogModels/UpdateBlogInputModel";
import {TPostDb} from "../../models/PostModels/GetPostOutputModel";
import PostModel from "../../models/PostModels/Post-model";


interface UpdateBlogArgs {
    id: string
    input: UpdateBlogInputModel
}

export const blogsRepository = {
    async createBlog(newBlog: GetBlogOutputModel): Promise<boolean> {
        try {
            const result = await blogsCollection.insertOne(newBlog);
            return Boolean(result.insertedId);
        } catch (error) {
            console.log(`blogsRepository.createBlog error is occurred: ${error}`);
            return false;
        }
    },

    async createPostInBlog(newPost: TPostDb): Promise<boolean> {
        try {
            await PostModel.create(newPost);
            return true;
        } catch (error) {
            console.log(`blogsRepository.createPostInBlog error is occurred: ${error}`);
            return false;
        }
    },

    async updateBlog({id, input}: UpdateBlogArgs): Promise<boolean> {
        try {
            const result = await blogsCollection.updateOne(
                {"_id": new ObjectId(id)},
                {$set: input}
            )
            return result?.matchedCount === 1;
            // смотрим matchedCount, а не modifiedCount, т.к. при полном соответствии
            // данных mongo не производит операцию обновления и не вернет ничего
        } catch (error) {
            console.log(`blogsRepository.updateBlog error is occurred: ${error}`);
            return false;
        }
    },

    async deleteBlogById(id: string): Promise<boolean> {
        try {
            const result = await blogsCollection.deleteOne({"_id": new ObjectId(id)});
            return result.deletedCount === 1;
        } catch (error) {
            console.log(`blogsRepository.deleteBlogById error is occurred: ${error}`);
            return false;
        }
    }
};
