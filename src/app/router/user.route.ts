import { NextFunction, Request, Response, Router } from 'express';
import { UserController } from '../controller/user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { Validation } from '../../validation/IO.validation';
import { USER_ROLES } from '../../enums/user.enums';
import auth from '../../middlewares/Auth.middleware';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = Router();

router
    .route("/")
    .get(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        UserController.profile
    )
    .post(
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
    .delete(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        UserController.profileDelete
    )

router
    .route("/status")
    .patch(
        auth( USER_ROLES.SERVICE_PROVIDER, USER_ROLES.USER ),
        UserController.status
    )

router
    .route("/image")
    .patch(
        auth( USER_ROLES.SERVICE_PROVIDER, USER_ROLES.USER ),
        fileUploadHandler(),
        UserController.uploadImages
    )

router
    .route("/job")
    .post(
        auth( USER_ROLES.USER ),
        fileUploadHandler(),
        validateRequest( Validation.jobPostZodSchem ),
        UserController.postJob
    )


export const UserRouter = router;



/*
{
    "fullName": "MD Sohidul Islam Ananto",
    "email": "anonto.fl.42@gmail.com",
    "phone": "01600101074",
    "city": "Narayangonj",
    "address": "Siddhirgonj, Mizmizy, Pinadi",
    "postalCode": "1430",
    "language": "SPANISH", // "ENGLISH" or "SPANISH" or "TURKISH" or "GERMAN"
    "category": "MERN Stack",
    "subCatagory": "FullStack",
    "samplePictures": "",
    "profileImage": "/uploads/profile.jpg",
    "serviceDescription": "If you only want a quick fix and don’t care about global types right now, you can use a type assertion in the middleware like:"
}
*/