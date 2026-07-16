import {model, Schema} from "mongoose";
import {GetVideoOutputModel} from "./GetVideoOutputModel";
import {add} from "date-fns";
import {AvailableResolutions} from "../../types/common";


const now = new Date();

const VideoSchema = new Schema<GetVideoOutputModel>({
    title: {type: String, required: true},
    author: {type: String, required: true},
    canBeDownloaded: {type: Boolean, default: false},
    minAgeRestriction: {type: Number, default: null, min: 0, max: 18},
    createdAt: {type: String, default: now.toISOString()},
    publicationDate: {
        type: String,
        required: true,
        default: add(now, {days: 1}).toISOString()
    },
    availableResolutions: {type: [String], enum: AvailableResolutions, default: null},
});

export default model("Video", VideoSchema);
