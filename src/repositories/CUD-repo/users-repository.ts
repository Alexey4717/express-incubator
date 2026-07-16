import {ObjectId} from "mongodb";

import {usersCollection} from "../../store/db";
import {GetUserOutputModelFromMongoDB} from "../../models/UserModels/GetUserOutputModel";
import {CreateUserInsertToDBModel} from "../../models/UserModels/CreateUserInsertToDBModel";
import {ChangeUserPasswordArgs, SetUserRecoveryDataInputType, UpdateUserConfirmationCodeInputType} from "./types";


export const usersRepository = {
    async createUser(newUser: CreateUserInsertToDBModel): Promise<GetUserOutputModelFromMongoDB> {
        try {
            const result = await usersCollection.insertOne(newUser);
            if (!result.insertedId) throw new Error('Insert user error');
            const createdUser = {
                ...newUser,
                _id: result.insertedId,
            };
            return createdUser
        } catch (error) {
            console.log(`usersRepository.createUser error is occurred: ${error}`)
            return {} as GetUserOutputModelFromMongoDB;
        }
    },

    async findByLoginOrEmail(loginOrEmail: string): Promise<GetUserOutputModelFromMongoDB | null> {
        return await usersCollection.findOne({
            $or: [
                {'accountData.login': loginOrEmail},
                {'accountData.email': loginOrEmail}
            ]
        });
    },

    async deleteUserById(id: string): Promise<boolean> {
        try {
            const result = await usersCollection.deleteOne({"_id": new ObjectId(id)});
            return result.deletedCount === 1;
        } catch (error) {
            console.log(`usersRepository.deleteUserById error is occurred: ${error}`)
            return false;
        }
    },

    async updateConfirmation(userId: ObjectId): Promise<boolean> {
        const result = await usersCollection.updateOne(
            {_id: userId},
            {$set: {'emailConfirmation.isConfirmed': true}}
        );
        return result.matchedCount === 1;
    },

    async changeUserPasswordAndNullifyRecoveryData({userId, passwordHash}: ChangeUserPasswordArgs): Promise<boolean> {
        const result = await usersCollection.updateOne(
            {_id: userId},
            {
                $set: {
                    'accountData.passwordHash': passwordHash,
                    recoveryData: null
                }
            }
        );
        return result.matchedCount === 1;
    },

    async setUserRecoveryData({userId, recoveryData}: SetUserRecoveryDataInputType): Promise<boolean> {
        const result = await usersCollection.updateOne(
            {_id: userId},
            {$set: {recoveryData}}
        );
        return result.matchedCount === 1;
    },

    async updateUserConfirmationCode({userId, newCode}: UpdateUserConfirmationCodeInputType): Promise<boolean> {
        const result = await usersCollection.updateOne(
            {_id: userId},
            {$set: {'emailConfirmation.confirmationCode': newCode}}
        );
        return result.matchedCount === 1;
    },

    async findByConfirmationCode(code: string): Promise<GetUserOutputModelFromMongoDB | null> {
        return usersCollection.findOne({'emailConfirmation.confirmationCode': code});
    },

    async findUserByRecoveryCode(code: string): Promise<GetUserOutputModelFromMongoDB | null> {
        return usersCollection.findOne({'recoveryData.recoveryCode': code});
    },
};