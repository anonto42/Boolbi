import { Router } from 'express';
import { UserController } from '../controller/user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { Validation } from '../../validation/IO.validation';
import { USER_ROLES } from '../../enums/user.enums';
import auth from '../../middlewares/Auth.middleware';

const router = Router();

router
    .route("/")
    .get(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        UserController.profile
    )
    .post(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        validateRequest(Validation.singnUpZodSchema),
        UserController.signupUser
    )
    .put(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        validateRequest(Validation.userUpdateProfileZodSchem),
        UserController.update
    )
    .patch(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        validateRequest(Validation.updateUserLangouageZodSchem),
        UserController.language
    )


export const UserRouter = router;