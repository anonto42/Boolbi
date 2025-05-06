import { Router } from 'express';
import { UserController } from '../controller/user.controller';


const router = Router();

router
    .route("/user")
    .get(

        UserController.signupUser
    )
    .post(
        
    )


export const UserRouter = router;