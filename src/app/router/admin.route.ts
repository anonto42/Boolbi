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
        auth( USER_ROLES.ADMIN, USER_ROLES.SERVICE_PROVIDER ),
        AdminController.customers
    )
    .patch(
        auth( USER_ROLES.ADMIN, USER_ROLES.SERVICE_PROVIDER ),
        validateRequest( AdminValidation.userUpdateSchema ),
        AdminController.updateAccountStatus
    )

export const AdminRoter = router;