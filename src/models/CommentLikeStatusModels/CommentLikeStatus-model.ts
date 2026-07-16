import {Schema, model} from "mongoose";

import {GetCommentLikeStatusOutputModel} from "./GetCommentLikeStatusOutputModel";
import {LikeStatus} from "../../types/common";


export const CommentLikeStatusSchema = new Schema<GetCommentLikeStatusOutputModel>({
    commentId: {type: String, required: true},
    userId: {type: String, required: true},
    likeStatus: {type: String, enum: LikeStatus},
    createdAt: {type: String, default: new Date().toISOString()},
})

export default model('commentLikeStatus', CommentLikeStatusSchema);
