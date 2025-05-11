import { Router } from "express";
import auth from "../../middlewares/Auth.middleware";
import { USER_ROLES } from "../../enums/user.enums";
import validateRequest from "../../middlewares/validateRequest";
import { ProviderController } from "../controller/provider.controller";
import { OrderValidator } from "../../validation/order.validation";
import { DelivaryValidation } from "../../validation/delivary.validation";
import fileUploadHandler from "../../middlewares/fileUploadHandler";


const router = Router();

router
    .route("/order")
    .get(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        validateRequest( OrderValidator.single ),
        ProviderController.gOrder
    )
    .delete(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        validateRequest( OrderValidator.deleteOrder ),
        ProviderController.DOrder
    )

router
    .route("/delivery")
    .post(
        auth( USER_ROLES.SERVICE_PROVIDER ),
        fileUploadHandler(),
        validateRequest( DelivaryValidation.createRequest ),
        ProviderController.CDelivery
    )





export const ProviderRoter = router;