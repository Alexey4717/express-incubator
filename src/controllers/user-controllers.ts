import {Response} from "express";
import {constants} from "http2";

import {Paginator, RequestWithBody, RequestWithParams, RequestWithQuery, SortDirections} from "../types/common";
import {GetUsersInputModel, SortUsersBy} from "../models/UserModels/GetUsersInputModel";
import {GetMappedUserOutputModel} from "../models/UserModels/GetUserOutputModel";
import {usersQueryRepository} from "../repositories/Queries-repo/users-query-repository";
import {getMappedUserViewModel} from "../helpers";
import {CreateUserInputModel} from "../models/UserModels/CreateUserInputModel";
import {authService} from "../domain/auth-service";
import {DeleteUserInputModel} from "../models/UserModels/DeleteUserInputModel";


export const userControllers = {
    async getUsers(
        req: RequestWithQuery<GetUsersInputModel>,
        res: Response<Paginator<GetMappedUserOutputModel[]>>
    ) {
        const resData = await usersQueryRepository.getUsers({
            searchLoginTerm: req.query.searchLoginTerm?.toString() || null, // by-default null
            searchEmailTerm: req.query.searchEmailTerm?.toString() || null, // by-default null
            sortBy: (req.query.sortBy?.toString() || 'createdAt') as SortUsersBy, // by-default createdAt
            sortDirection: (req.query.sortDirection?.toString() || SortDirections.desc) as SortDirections, // by-default desc
            pageNumber: +(req.query.pageNumber || 1), // by-default 1
            pageSize: +(req.query.pageSize || 10) // by-default 10
        })
        const {
            pagesCount,
            page,
            pageSize,
            totalCount,
            items
        } = resData || {};
        res.status(constants.HTTP_STATUS_OK).json({
            pagesCount,
            page,
            pageSize,
            totalCount,
            items: items.map(getMappedUserViewModel)
        });
    },

    async createUser(
        req: RequestWithBody<CreateUserInputModel>,
        res: Response<GetMappedUserOutputModel>
    ) {
        const createdUser = await authService.createUser(req.body);
        res.status(constants.HTTP_STATUS_CREATED).json(getMappedUserViewModel(createdUser));
    },

    async deleteUser(
        req: RequestWithParams<DeleteUserInputModel>,
        res: Response
    ) {
        const resData = await authService.deleteUserById(req.params.id);
        if (!resData) {
            res.sendStatus(constants.HTTP_STATUS_NOT_FOUND);
            return;
        }
        res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
    },
};
