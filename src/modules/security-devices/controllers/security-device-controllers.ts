import { Request, Response } from 'express';

import { constants } from 'http2';
import { injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { JwtService } from '@/core/application/jwt-service';
import { isFailure, sendFailure } from '@/core/result/handle-result';
import { RequestWithParams } from '@/core/types/common';

import { getMappedSecurityDevicesViewModel } from '../helpers/map-to-security-device-output';
import { SecurityDevicesQueryRepository } from '../repositories/Queries/security-devices-query-repository';
import { SecurityDevicesService } from '../services/security-devices-service';

@injectable()
export class SecurityDeviceControllers {
  constructor(
    protected securityDevicesQueryRepository: SecurityDevicesQueryRepository,
    protected securityDevicesService: SecurityDevicesService,
    protected jwtService: JwtService,
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
    const refreshToken = req?.cookies?.refreshToken;
    const deviceId = req.params.id;

    if (!refreshToken) {
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
      return;
    }

    const { userId } =
      (await this.jwtService.getDeviceAndUserIdsByRefreshToken(refreshToken)) ||
      {};

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
