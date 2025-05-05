import { Router } from 'express';
import { UserController } from '../controller/user.controller';


const router = Router();

router
    .get(
        "/test",
        UserController.signupUser
    )


export const UserRouter = router;