import { injectable } from 'inversify';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';

import { settings } from '../settings/index';
import { TokenTypes } from '../types/common';

type AccessJwtUser = {
  _id: ObjectId;
};

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
  async createAccessJWT(user: AccessJwtUser): Promise<string> {
    return jwt.sign({ userId: user._id }, settings.ACCESS_JWT_SECRET, {
      expiresIn: settings.JWT_ACCESS_EXPIRATION as SignOptions['expiresIn'],
      jwtid: uuidv4(),
    });
  }

  async createRefreshJWT(
    payload: CreateRefreshJWTArg,
  ): Promise<{ token: string; jti: string }> {
    const jti = uuidv4();
    const token = jwt.sign(payload, settings.REFRESH_JWT_SECRET, {
      expiresIn: settings.JWT_REFRESH_EXPIRATION as SignOptions['expiresIn'],
      jwtid: jti,
    });
    return { token, jti };
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
  ): Promise<{ deviceId: ObjectId; userId: ObjectId; jti: string } | null> {
    try {
      const { deviceId, userId, jti } = jwt.verify(
        refreshToken,
        settings.REFRESH_JWT_SECRET,
      ) as JwtPayload;
      if (!deviceId || !userId || !jti) {
        return null;
      }
      return {
        deviceId: new ObjectId(deviceId),
        userId: new ObjectId(userId),
        jti,
      };
    } catch {
      return null;
    }
  }
}
