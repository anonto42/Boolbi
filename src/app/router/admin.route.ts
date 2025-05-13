import { Router } from "express";
import auth from "../../middlewares/Auth.middleware";
import { USER_ROLES } from "../../enums/user.enums";
import validateRequest from "../../middlewares/validateRequest";
import fileUploadHandler from "../../middlewares/fileUploadHandler";
import { AdminController } from "../controller/admin.controller";
import { AdminValidation } from "../../validation/admin.validation";


const router = Router();

router
    .route("/")
    .get(
        auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN ),
        AdminController.overView
    )

router 
    .route("/customer")
    .get(
        auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN ),
        AdminController.customers
    )
    .patch(
        auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN ),
        validateRequest( AdminValidation.userUpdateSchema ),
        AdminController.updateAccountStatus
    )

router
    .route("/provider")
    .get(
        auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN ),
        AdminController.providers
    )

router 
    .route("/payment")
    .get( //Update some think later on aggrigation // todo
        auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN ),
        AdminController.payments
    )

router
    .route("/category")
    .get(
        auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.SERVICE_PROVIDER, USER_ROLES.USER ),
        AdminController.catagroys
    )
    .post(
        auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN ),
        fileUploadHandler(),
        validateRequest( AdminValidation.catagorySchema),
        AdminController.newCatagroys
    )
    .patch(
        auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN ),
        fileUploadHandler(),
        AdminController.updateCatagroys
    )
    .delete(
        auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN ),
        AdminController.deleteCatagroys
    )

router
    .route("/announcements") 
    .get(
        auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.SERVICE_PROVIDER, USER_ROLES.USER),
        AdminController.getAnnounsments
    )
    .post(
        auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN ),
        validateRequest( AdminValidation.announcementSchema ),
        AdminController.createAnnounsments
    )
    .put(
        auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN ),
        validateRequest( AdminValidation.announceUpdate ),
        AdminController.updateAnnounsments
    )
    .patch(
        auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN ),
        validateRequest( AdminValidation.changeStatusAndUpdate),
        AdminController.activityControleOfAnnounsments
    )
    .delete(
        auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN ),
        validateRequest( AdminValidation.deleteAnnouncement ),
        AdminController.deleteAnnounsments
    )

router
    .route("/policy")
    .get(
        auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        AdminController.getPrivacyPolicy
    )
    .patch(
        auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN ),
        validateRequest( AdminValidation.updatedPolicy ),
        AdminController.editeyPolicy
    )


export const AdminRoter = router;