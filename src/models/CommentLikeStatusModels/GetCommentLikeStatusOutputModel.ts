import {WithId} from 'mongodb';
import {LikeStatus} from "../../types/common";


export type GetCommentLikeStatusOutputModel = WithId<{
    commentId: string
    userId: string
    likeStatus: LikeStatus
    createdAt: string
}>;
