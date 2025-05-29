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
    .route("/complete-orders")
    .get(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        ProviderController.completedOrders
    )

router
    .route("/delivery")
    .get(
        auth( USER_ROLES.SERVICE_PROVIDER, USER_ROLES.USER ),
        ProviderController.GDRequest
    )
    .post(
        auth( USER_ROLES.SERVICE_PROVIDER ),
        fileUploadHandler(),
        validateRequest( DelivaryValidation.createRequest ),
        ProviderController.CDelivery
    )
    .patch(
        auth( USER_ROLES.USER ),
        validateRequest( DelivaryValidation.acceptdelivaryRequestZodSchema ),
        ProviderController.requestStatueUpdate
    )

router
    .route('/a-delivery-request')
    .get(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        ProviderController.ADelivery
    )

router
    .route('/extends-delivery-request')
    .get(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER ),
        ProviderController.deliveryRequests
    )
    .post(
        auth( USER_ROLES.SERVICE_PROVIDER ),
        validateRequest( DelivaryValidation.timeExtendDelivaryRequestZodSchema ),
        ProviderController.extendsDeliveryRequest
    )
    .patch(
        auth( USER_ROLES.USER ),
        validateRequest( DelivaryValidation.timeExtendDelivaryRequestIntraction ),
        ProviderController.delivaryTimeExtendsRequest
    )

router 
    .route("/verify")
    .get(
        auth( 
            USER_ROLES.SERVICE_PROVIDER, 
            USER_ROLES.ADMIN, 
            USER_ROLES.SUPER_ADMIN 
        ),
        ProviderController.verificatioData
    )
    .post(
        auth( USER_ROLES.SERVICE_PROVIDER ),
        fileUploadHandler(),
        ProviderController.providerAccountVerification
    )
    .patch(
        auth( USER_ROLES.SERVICE_PROVIDER ),
        fileUploadHandler(),
        ProviderController.providerAccountVerification
    )

export const ProviderRoter = router;