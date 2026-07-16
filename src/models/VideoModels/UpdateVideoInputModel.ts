import {GetVideoOutputModel} from "./GetVideoOutputModel";

export type UpdateVideoInputModel = {
    /**
     * Update title of video. Required. Max length: 40.
     */
    title: GetVideoOutputModel["title"],

    /**
     * Update author of video. Required. Max length: 20.
     */
    author: GetVideoOutputModel["author"],

    /**
     * Update available resolutions for video. At least one resolution should be added.
     */
    availableResolutions?: GetVideoOutputModel["availableResolutions"]

    /**
     * Update permission to download. Not required. By default - false.
     */
    canBeDownloaded?: GetVideoOutputModel["canBeDownloaded"]

    /**
     * Update restriction for min age. Not required. Min - 1, max - 18, null - no restriction.
     */
    minAgeRestriction?: GetVideoOutputModel["minAgeRestriction"]

    /**
     * Update date of publication video. Not required. String of date.
     */
    publicationDate?: GetVideoOutputModel["publicationDate"]
}
