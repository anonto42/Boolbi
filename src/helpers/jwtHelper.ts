import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import config from '../config';

const createToken = (payload: object): string => {
  const secret = config.jwt_secret;
  const expiresIn = config.jwt_expire;

  if (!secret || !expiresIn) {
    throw new ApiError(
      StatusCodes.FAILED_DEPENDENCY,
      'JWT_SECRET or JWT_EXPIRE_IN is not defined in environment variables.'
    );
  }

  const options: any = {
    expiresIn: expiresIn,
  };

  return jwt.sign(payload, secret as jwt.Secret, options);
};

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const jwtHelper = { createToken, verifyToken };
