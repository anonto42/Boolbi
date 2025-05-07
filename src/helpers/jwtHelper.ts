import jwt, { JwtPayload } from 'jsonwebtoken';
import ApiError from '../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import config from '../config';

export interface PayloadType{
  userID: string,
  role: string,
  language: string,
}

const createToken = (payload: PayloadType): string => {
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


const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwt_expire) as JwtPayload;
};

export const jwtHelper = { createToken, verifyToken };
