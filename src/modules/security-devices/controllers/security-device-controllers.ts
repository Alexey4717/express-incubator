import { Request, Response } from 'express';

import { constants } from 'http2';
import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { isFailure, sendFailure } from '@/core/result/handle-result';
import { RequestWithParams } from '@/core/types/common';

import { getMappedSecurityDevicesViewModel } from '../helpers/map-to-security-device-output';
import type { ISecurityDevicesQueryRepository } from '../repositories/contracts/ISecurityDevicesQueryRepository';
import { SECURITY_DEVICES_TYPES } from '../security-devices.tokens';
import { SecurityDevicesService } from '../services/security-devices-service';

@injectable()
export class SecurityDeviceControllers {
  constructor(
    @inject(SECURITY_DEVICES_TYPES.ISecurityDevicesQueryRepository)
    protected securityDevicesQueryRepository: ISecurityDevicesQueryRepository,
    protected securityDevicesService: SecurityDevicesService,
  ) {}

  async getSecurityDevices(req: Request, res: Response) {
    const user = req.context?.user;

    if (!user) {
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
      return;
    }

    const result =
      await this.securityDevicesQueryRepository.getAllSecurityDevicesByUserId(
        user._id.toString(),
      );

    res
      .status(constants.HTTP_STATUS_OK)
      .json(result.map(getMappedSecurityDevicesViewModel));
  }

  async deleteAllSecurityDevicesOmitCurrent(req: Request, res: Response) {
    const userId = req.context?.user?._id;
    const deviceId = req.context?.securityDevice?._id;

    if (!userId || !deviceId) {
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
      return;
    }

    const result =
      await this.securityDevicesService.deleteAllSecurityDevicesOmitCurrent({
        deviceId: new ObjectId(deviceId),
        userId: new ObjectId(userId),
      });

    if (isFailure(result)) {
      sendFailure(res, result);
      return;
    }

    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }

  async deleteSecurityDeviceById(
    req: RequestWithParams<{ id: string }>,
    res: Response,
  ) {
    const userId = req.context?.user?._id;
    const deviceId = req.params.id;

    if (!userId) {
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
      return;
    }

    const result = await this.securityDevicesService.deleteSecurityDeviceById(
      new ObjectId(deviceId),
      new ObjectId(userId),
    );

    if (isFailure(result)) {
      if (result.extensions?.reason === 'DeleteDeviceFailed') {
        res.sendStatus(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
        return;
      }
      sendFailure(res, result);
      return;
    }

    res.sendStatus(constants.HTTP_STATUS_NO_CONTENT);
  }
}
