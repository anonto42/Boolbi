import { Router } from 'express';
import { UserController } from '../controller/user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { Validation } from '../../validation/IO.validation';

const router = Router();

router
    .route("/")
    .post(
        validateRequest(Validation.singnUpZodSchema),
        UserController.signupUser
    )


export const UserRouter = router;