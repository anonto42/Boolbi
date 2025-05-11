import { Router } from "express";
import auth from "../../middlewares/Auth.middleware";
import { USER_ROLES } from "../../enums/user.enums";
import validateRequest from "../../middlewares/validateRequest";
import { ProviderController } from "../controller/provider.controller";
import { OrderValidator } from "../../validation/order.validation";



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





export const ProviderRoter = router;