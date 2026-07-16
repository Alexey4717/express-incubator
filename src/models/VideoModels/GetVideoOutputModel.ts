import {ObjectId} from 'mongodb';

import {AvailableResolutions} from '../../types/common';


export type GetVideoOutputModel = {
    /**
     * video title
     */
    title: string

    /**
     * video author
     */
    author: string

    /**
     * showing can video is downloaded. By default - false.
     */
    canBeDownloaded: boolean

    /**
     * min age restriction for watching video. Min - 0, max - 18, null - no restriction. By default - null.
     */
    minAgeRestriction: number | null

    /**
     * Date of created video.
     */
    createdAt: string

    /**
     * Date of publication video. By default - next day after date of created video.
     */
    publicationDate: string

    /**
     * Available resolutions of video (enum), can be nullable.
     */
    availableResolutions: AvailableResolutions[] | null
}

export type GetVideoOutputModelFromMongoDB = GetVideoOutputModel & {
    /**
     * Inserted id video from mongodb
     */
    _id: ObjectId
}

export type GetMappedVideoOutputModel = GetVideoOutputModel & {
    /**
     * Mapped id of video from db
     */
    id: string
}
