import {ObjectId} from 'mongodb';

import {securityDevicesCollection} from "../../store/db";
import {
    GetSecurityDeviceOutputModel,
    GetSecurityDeviceOutputModelFromMongoDB
} from "../../models/SecurityDeviceModels/GetSecurityDeviceOutputModel";


type UpdateSecurityDeviceData = {
    ip: string
    title: string
    lastActiveDate: string
    expiredAt: string
};

interface updateSecurityDeviceByIdArgs {
    deviceId: ObjectId
    updateSecurityDeviceData: UpdateSecurityDeviceData
}

interface DeleteAllUserSecurityDevicesOmitCurrentArgs {
    deviceId: ObjectId
    userId: ObjectId
}

export const securityDevicesRepository = {
    async createSecurityDevice(newDevice: GetSecurityDeviceOutputModelFromMongoDB): Promise<boolean> {
        try {
            const result = await securityDevicesCollection.insertOne(newDevice);
            return Boolean(result.insertedId);
        } catch (error) {
            console.log(`securityDevicesRepository.createSecurityDevice error is occurred: ${error}`);
            return false;
        }
    },

    async updateSecurityDeviceById({
                                       deviceId,
                                       updateSecurityDeviceData
                                   }: updateSecurityDeviceByIdArgs): Promise<boolean> {
        try {
            const devices = await securityDevicesCollection.find({}).toArray();

            const result = await securityDevicesCollection.updateOne(
                {_id: new ObjectId(deviceId)},
                {$set: {...updateSecurityDeviceData}}
            );

            return result?.matchedCount === 1;
        } catch (error) {
            console.log(`securityDevicesRepository.updateSecurityDeviceById error is occurred: ${error}`);
            return false;
        }
    },

    async deleteAllUserSecurityDevicesOmitCurrent({
                                                      deviceId,
                                                      userId
                                                  }: DeleteAllUserSecurityDevicesOmitCurrentArgs): Promise<boolean> {
        try {
            const result = await securityDevicesCollection.deleteMany({
                userId: userId.toString(),
                // $not: { deviceId }
                _id: {$ne: deviceId}
            });
            return result?.deletedCount > 0;
        } catch (error) {
            console.log(`securityDevicesRepository.deleteAllUserSecurityDevicesOmitCurrent error is occurred: ${error}`);
            return false;
        }
    },

    async deleteSecurityDeviceById(deviceId: ObjectId): Promise<boolean> {
        try {
            const result = await securityDevicesCollection.deleteOne({_id: new ObjectId(deviceId)});
            return result?.deletedCount === 1;
        } catch (error) {
            console.log(`securityDevicesRepository.deleteSecurityDeviceById error is occurred: ${error}`);
            return false;
        }
    },
};
