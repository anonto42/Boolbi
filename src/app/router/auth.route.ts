import { Router } from 'express';
import { AuthController } from '../controller/auth.controller';
import validateRequest from '../../middlewares/validateRequest';
import { Validation } from '../../validation/IO.validation';

const router = Router();

router
    .route("/sign-in")
    .post(
        validateRequest(Validation.signInZodSchema),
        AuthController.SignIn
    )


export const AuthRouter = router;