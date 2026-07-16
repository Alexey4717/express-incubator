import {AvailableResolutions, DataBase, LikeStatus} from "../types/common";

export const db: DataBase = {
    users: [
        {
            id: 1,
            login: 'admin',
            password: 'qwerty',
        }
    ],

    videos: [
        {
            id: '0',
            title: "string",
            author: "string",
            canBeDownloaded: true,
            minAgeRestriction: null,
            createdAt: "2023-01-05T10:31:38.546Z",
            publicationDate: "2023-01-05T10:31:38.546Z",
            availableResolutions: [
                AvailableResolutions.P144
            ]
        }
    ],

    blogs: [
        {
            id: "123",
            name: "blog1",
            description: "blog description",
            websiteUrl: "https://websiteUrl.com",
            isMembership: true,
            createdAt: new Date().toISOString()
        }
    ],

    posts: [
        {
            id: "456",
            title: "title",
            shortDescription: "short description",
            content: "content",
            blogId: "123",
            blogName: "blog1",
            createdAt: new Date().toISOString(),
            extendedLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: LikeStatus.None,
                newestLikes: [],
            }
        }
    ]
};
