import { Request, Response } from 'express';

import { constants } from 'http2';
import { inject, injectable } from 'inversify';
import { ObjectId } from 'mongodb';

import { CommandBus } from '@/core/cqrs/buses/command-bus';
import { QueryBus } from '@/core/cqrs/buses/query-bus';
import { CQRS_TYPES } from '@/core/cqrs/cqrs.tokens';
import { isFailure, sendFailure } from '@/core/result/handle-result';
import type { Result } from '@/core/result/result.type';
import { RequestWithParams } from '@/core/types/common';

import { DeleteAllSecurityDevicesExceptCurrentCommand } from '../application/commands/delete-all-security-devices-except-current.command';
import { DeleteSecurityDeviceCommand } from '../application/commands/delete-security-device.command';
import { GetSecurityDevicesQuery } from '../application/queries/get-security-devices.query';
import { getMappedSecurityDevicesViewModel } from '../helpers/map-to-security-device-output';
import type { TSecurityDeviceDb } from '../models/GetSecurityDeviceOutputModel';

@injectable()
export class SecurityDeviceControllers {
  constructor(
    @inject(CQRS_TYPES.QueryBus)
    protected queryBus: QueryBus,
    @inject(CQRS_TYPES.CommandBus)
    protected commandBus: CommandBus,
  ) {}

  async getSecurityDevices(req: Request, res: Response) {
    const user = req.context?.user;

    if (!user) {
      res.sendStatus(constants.HTTP_STATUS_UNAUTHORIZED);
      return;
    }

    const result = await this.queryBus.execute<TSecurityDeviceDb[]>(
      new GetSecurityDevicesQuery(user._id.toString()),
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

    const result = await this.commandBus.execute<Result<null>>(
      new DeleteAllSecurityDevicesExceptCurrentCommand({
        deviceId: new ObjectId(deviceId),
        userId: new ObjectId(userId),
      }),
    );

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

    const result = await this.commandBus.execute<Result<null>>(
      new DeleteSecurityDeviceCommand({
        deviceId: new ObjectId(deviceId),
        userId: new ObjectId(userId),
      }),
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
