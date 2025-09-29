import { Router } from 'express';
import { AuthController } from '../controller/auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { Validation } from '../../validation/IO.validation';
import auth from '../../middlewares/Auth.middleware';
import { USER_ROLES } from '../../enums/user.enums';

const router = Router();

router
    .route("/sign-in")
    .get(
        AuthController.getGestUser
    )
    .post(
        validateRequest(Validation.signInZodSchema),
        AuthController.SignIn
    )

router
    .route("/send-otp")
    .post(
        validateRequest(Validation.authEmailOTPZodSchema),
        AuthController.getOpt
    )

router
    .route("/verify-otp")
    .post(
        validateRequest(Validation.OTPZodSchema),
        AuthController.verifyOtp
    )

router
    .route("/change-password")
    .post(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN ),
        AuthController.changePassword
    )

router
    .route("/forget-password")
    .post(
        validateRequest(Validation.forgetPassword),
        AuthController.forgetPassword
    )

router
    .route("/socal-login")
    .post(
        validateRequest(Validation.socalLoginZodSchema),
        AuthController.socalLogin
    )
    .patch(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN ),
        AuthController.ftm_token
    )

export const AuthRouter = router;