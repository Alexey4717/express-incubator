import {GetVideoOutputModel} from "./GetVideoOutputModel";

export type CreateVideoInputModel = {
    /**
     * Set title of video. Required. Max length: 40.
     */
    title: GetVideoOutputModel["title"],

    /**
     * Set author of video. Required. Max length: 20.
     */
    author: GetVideoOutputModel["author"],

    /**
     * Set available resolutions for video. At least one resolution should be added.
     */
    availableResolutions: GetVideoOutputModel["availableResolutions"]
}
