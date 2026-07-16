import { injectable } from 'inversify';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

import { settings } from '../../app/settings/index';
import { GetUserOutputModelFromMongoDB } from '../../modules/users/models/UserModels/GetUserOutputModel';
import { TokenTypes } from '../types/common';

type ManageTokenInputType = {
  token: string;
  type: TokenTypes;
};

type CreateRefreshJWTArg = {
  userId: ObjectId;
  deviceId: ObjectId;
};

@injectable()
export class JwtService {
  async createAccessJWT(user: GetUserOutputModelFromMongoDB): Promise<string> {
    return jwt.sign({ userId: user._id }, settings.ACCESS_JWT_SECRET, {
      expiresIn: settings.JWT_ACCESS_EXPIRATION as SignOptions['expiresIn'],
      jwtid: uuidv4(),
    });
  }

  async createRefreshJWT(payload: CreateRefreshJWTArg) {
    return jwt.sign(payload, settings.REFRESH_JWT_SECRET, {
      expiresIn: settings.JWT_REFRESH_EXPIRATION as SignOptions['expiresIn'],
      jwtid: uuidv4(),
    });
  }

  async getUserIdByToken({
    token,
    type,
  }: ManageTokenInputType): Promise<ObjectId | null> {
    try {
      const secret =
        type === TokenTypes.access
          ? settings.ACCESS_JWT_SECRET
          : settings.REFRESH_JWT_SECRET;
      const decoded = jwt.verify(token, secret);
      return (decoded as JwtPayload).userId;
    } catch {
      return null;
    }
  }

  async getDeviceAndUserIdsByRefreshToken(
    refreshToken: string,
  ): Promise<{ deviceId: ObjectId; userId: ObjectId } | null> {
    try {
      const { deviceId, userId } = jwt.verify(
        refreshToken,
        settings.REFRESH_JWT_SECRET,
      ) as JwtPayload;
      return { deviceId: new ObjectId(deviceId), userId: new ObjectId(userId) };
    } catch {
      return null;
    }
  }
}
