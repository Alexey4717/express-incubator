import {model, Schema} from "mongoose";
import {TCommentDb, TReactions} from "./GetCommentOutputModel";
import {LikeStatus} from "../../types/common";


const ReactionsSchema = new Schema<TReactions>({
    userId: {type: String, required: true},
    likeStatus: {type: String, enum: LikeStatus, required: true},
    createdAt: {type: String, required: true, default: new Date().toISOString()}
}, {_id: false, id: false})

const CommentSchema = new Schema<TCommentDb>({
    postId: {type: String, required: true},
    content: {type: String, required: true, min: 20, max: 300},
    commentatorInfo: {
        userId: {type: String, required: true},
        userLogin: {type: String, required: true},
    },
    createdAt: {type: String, default: new Date().toISOString()},
    reactions: {type: [ReactionsSchema], default: []   }
});

export default model("Comment", CommentSchema);
