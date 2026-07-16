import {ObjectId} from 'mongodb';

import {GetMappedVideoOutputModel, GetVideoOutputModelFromMongoDB} from "./models/VideoModels/GetVideoOutputModel";
import {GetBlogOutputModelFromMongoDB, GetMappedBlogOutputModel} from "./models/BlogModels/GetBlogOutputModel";
import {
    GetMappedPostOutputModel,
    TPostDb,
    ExtendedLikesInfo,
    TReactions as TReactionsPost, NewestLikeType
} from "./models/PostModels/GetPostOutputModel";
import {AvailableResolutions} from './types/common';
import {db} from "./store/mockedDB";
import {GetMappedUserOutputModel, GetUserOutputModelFromMongoDB} from "./models/UserModels/GetUserOutputModel";
import {MeOutputModel} from "./models/AuthModels/MeOutputModel";
import {
    GetMappedCommentOutputModel,
    LikesInfo,
    TCommentDb,
    TReactions as TReactionsComment
} from "./models/CommentsModels/GetCommentOutputModel";
import {LikeStatus} from './types/common';
import {
    GetMappedSecurityDeviceOutputModel,
    GetSecurityDeviceOutputModelFromMongoDB
} from "./models/SecurityDeviceModels/GetSecurityDeviceOutputModel";


export const getMappedVideoViewModel = ({
                                            _id,
                                            title,
                                            author,
                                            canBeDownloaded,
                                            minAgeRestriction,
                                            createdAt,
                                            publicationDate,
                                            availableResolutions
                                        }: GetVideoOutputModelFromMongoDB): GetMappedVideoOutputModel => ({
    id: _id.toString(),
    title,
    author,
    canBeDownloaded,
    minAgeRestriction,
    createdAt,
    publicationDate,
    availableResolutions
});

export const getMappedBlogViewModel = ({
                                           _id,
                                           name,
                                           description,
                                           websiteUrl,
                                           isMembership,
                                           createdAt
                                       }: GetBlogOutputModelFromMongoDB): GetMappedBlogOutputModel => ({
    id: _id.toString(),
    name,
    description,
    websiteUrl,
    isMembership,
    createdAt
});

export const getMappedPostViewModel = (({
                                            _id,
                                            title,
                                            content,
                                            shortDescription,
                                            blogName,
                                            blogId,
                                            createdAt,
                                            currentUserId,
                                            reactions
                                        }: TPostDb & { currentUserId?: string }): GetMappedPostOutputModel => {
    const extendedLikesInfo = reactions?.length > 0
        ? (reactions.reduce((result: ExtendedLikesInfo, reaction: TReactionsPost) => {
                if (reaction.likeStatus === LikeStatus.Like) {
                    const currentReaction = {
                        userId: reaction.userId,
                        login: reaction.userLogin,
                        addedAt: reaction.createdAt
                    };

                    result.newestLikes.push(currentReaction);

                    if (result.newestLikes.length > 1) {
                        result.newestLikes.sort((a: NewestLikeType, b: NewestLikeType) => {
                            if (new Date(a.addedAt).valueOf() < new Date(b.addedAt).valueOf()) return 1;
                            if (new Date(a.addedAt).valueOf() === new Date(b.addedAt).valueOf()) return 0;
                            return -1;
                        })
                    }

                    if (result.newestLikes.length === 4) {
                        result.newestLikes.splice(3, 1);
                    }
                }

                if (reaction.likeStatus === LikeStatus.Like) result.likesCount += 1;
                if (reaction.likeStatus === LikeStatus.Dislike) result.dislikesCount += 1;
                if (reaction.userId === currentUserId) {
                    result.myStatus = reaction.likeStatus;
                }
                return result;
            }, {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: LikeStatus.None,
                newestLikes: []
            })
        ) : ({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: LikeStatus.None,
            newestLikes: []
        });

    return {
        id: _id.toString(),
        title,
        shortDescription,
        content,
        blogId,
        blogName,
        createdAt,
        extendedLikesInfo
    }
});

export const getMappedUserViewModel = ({
                                           _id,
                                           accountData,
                                       }: GetUserOutputModelFromMongoDB): GetMappedUserOutputModel => ({
    id: _id.toString(),
    login: accountData.login,
    email: accountData.email,
    createdAt: accountData.createdAt
});

export const getMappedMeViewModel = ({
                                         _id,
                                         accountData,
                                     }: GetUserOutputModelFromMongoDB): MeOutputModel => ({
    email: accountData.email,
    login: accountData.login,
    userId: _id.toString(),
});

export const getMappedCommentViewModel = ({
                                              _id,
                                              content,
                                              commentatorInfo,
                                              createdAt,
                                              reactions,
                                              currentUserId
                                          }: TCommentDb & { currentUserId?: string }
): GetMappedCommentOutputModel => {
    const {userId, userLogin} = commentatorInfo || {};

    const likesInfo = reactions?.length > 0
        ? (reactions.reduce((result: LikesInfo, reaction: TReactionsComment) => {
                if (reaction.likeStatus === LikeStatus.Like) result.likesCount += 1;
                if (reaction.likeStatus === LikeStatus.Dislike) result.dislikesCount += 1;
                if (reaction.userId === currentUserId) {
                    result.myStatus = reaction.likeStatus;
                }
                return result;
            }, {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: LikeStatus.None
            })
        ) : ({
            likesCount: 0,
            dislikesCount: 0,
            myStatus: LikeStatus.None
        });

    return {
        id: _id?.toString(),
        content,
        commentatorInfo: {
            userId,
            userLogin
        },
        createdAt,
        likesInfo,
    }
};

export const getMappedSecurityDevicesViewModel = ({
                                                      _id,
                                                      ip,
                                                      title,
                                                      lastActiveDate

                                                  }: GetSecurityDeviceOutputModelFromMongoDB): GetMappedSecurityDeviceOutputModel => {
    return {
        deviceId: _id.toString(),
        ip,
        title,
        lastActiveDate
    }
};

export const getCorrectIncludesAvailableResolutions = (availableResolutions: AvailableResolutions[]): boolean => {
    const enumValues = Object.values(AvailableResolutions)
    const intersections = availableResolutions
        .filter((key) => !enumValues.includes(key));
    return Boolean(intersections.length);
};

export const getCorrectCommentLikeStatus = (commentLikeStatus: LikeStatus): boolean => {
    const enumValues = Object.values(LikeStatus)
    return enumValues.includes(commentLikeStatus);
};

export const getEncodedAuthToken = () => {
    return Buffer
        .from(`${db.users[0].login}:${db.users[0].password}`, 'utf-8')
        .toString('base64');
};

type CalculateAndGetSkipValueArgs = {
    pageNumber: number
    pageSize: number
};

export const calculateAndGetSkipValue = ({pageNumber, pageSize}: CalculateAndGetSkipValueArgs) => {
    return (pageNumber - 1) * pageSize;
};
