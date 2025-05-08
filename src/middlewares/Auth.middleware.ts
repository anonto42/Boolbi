
import { StatusCodes } from 'http-status-codes';
import { Secret } from 'jsonwebtoken';
import ApiError from '../errors/ApiError';
import { jwtHelper } from '../helpers/jwtHelper';
import config from '../config';
import { NextFunction, Request, Response } from 'express';

const auth =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenWithBearer = req.headers.authorization;
      if (!tokenWithBearer) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
      }

      if (tokenWithBearer && tokenWithBearer.startsWith('Bearer')) {
        const token = tokenWithBearer.split(' ')[1];

        console.log("Next will be the Verify JWT")
        //verify token
        const verifyUser = jwtHelper.verifyToken(
          token,
          config.jwt_secret as Secret
        );
        
        //guard user
        if (roles.length && !roles.includes(verifyUser.role)) {
          throw new ApiError(
            StatusCodes.FORBIDDEN,
            "You don't have permission to access this api"
          );
        }
         //@ts-ignore
        req.user = verifyUser;
        next();
      }
    } catch (error) {
      next(error);
    }
  };

export default auth;
