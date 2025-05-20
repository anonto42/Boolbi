import { Router } from 'express';
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
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN ),
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
    .route('/privacy')
    .get(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        UserController.privacy
    )

router
    .route('/condition')
    .get(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        UserController.condition
    )

router
    .route("/image")
    .patch(
        auth( USER_ROLES.SERVICE_PROVIDER, USER_ROLES.USER ),
        fileUploadHandler(),
        UserController.uploadImages
    )

router
    .route("/post")
    .get(
        auth(USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER),
        UserController.post
    )
    .post(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER),
        fileUploadHandler(),
        validateRequest( Validation.jobPostZodSchem ),
        UserController.postJob
    )
    .put(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        fileUploadHandler(),
        validateRequest( Validation.jobPostZodSchem ),
        UserController.updateJob
    )
    .delete(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER),
        UserController.deletePost
    )

router
    .route("/favorite")
    .get(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        UserController.getFavorite
    )
    .patch(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        UserController.favorite
    )
    .delete(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        UserController.removeFavorite
    )

router
    .route("/offer")
    .get(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER),
        UserController.offers
    )
    .post(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        fileUploadHandler(),
        validateRequest(Validation.orderValidation),
        UserController.cOffer
    )
    .patch(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        validateRequest( Validation.offerValidation ),
        UserController.IOffer
    )
    .delete(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        validateRequest( Validation.offerDeletaionValidationZod ),
        UserController.DOffer
    )

router
    .route("/suport-request")
    .post(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
        UserController.supportRequest
    )


export const UserRouter = router;