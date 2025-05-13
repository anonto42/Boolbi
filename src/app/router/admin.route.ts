import { Router } from "express";
import auth from "../../middlewares/Auth.middleware";
import { USER_ROLES } from "../../enums/user.enums";
import validateRequest from "../../middlewares/validateRequest";
import { ProviderController } from "../controller/provider.controller";
import { OrderValidator } from "../../validation/order.validation";
import { DelivaryValidation } from "../../validation/delivary.validation";
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

export const AdminRoter = router;