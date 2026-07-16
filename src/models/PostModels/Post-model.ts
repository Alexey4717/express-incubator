import {model, Schema} from "mongoose";
import {TPostDb, TReactions} from "./GetPostOutputModel";
import {LikeStatus} from "../../types/common";


const ReactionsSchema = new Schema<TReactions>({
    userId: {type: String, required: true},
    userLogin: {type: String, required: true},
    likeStatus: {type: String, enum: LikeStatus, required: true},
    createdAt: {type: String, required: true, default: new Date().toISOString()}
}, {_id: false, id: false})

const PostSchema = new Schema<TPostDb>({
    title: {type: String, required: true},
    shortDescription: {type: String, required: true},
    content: {type: String, required: true},
    blogId: {type: String, required: true},
    blogName: {type: String, required: true},
    createdAt: {type: String, default: new Date().toISOString()},
    reactions: {type: [ReactionsSchema], default: []}
}, {timestamps:true});

export default model("Post", PostSchema);
