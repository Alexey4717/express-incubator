import {ObjectId} from "mongodb";
import {RecoveryDataType} from "../../models/UserModels/CreateUserInsertToDBModel";


export type UpdateUserConfirmationCodeInputType = {
    userId: ObjectId
    newCode: string
};

export type ChangeUserPasswordArgs = {
    userId: ObjectId
    passwordHash: string
};

export type SetUserRecoveryDataInputType = {
    userId: ObjectId
    recoveryData: RecoveryDataType
};
