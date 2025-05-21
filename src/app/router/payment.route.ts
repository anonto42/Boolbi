import { Router } from "express";
import auth from "../../middlewares/Auth.middleware";
import { USER_ROLES } from "../../enums/user.enums";
import { PaymentController } from "../controller/payment.controller";
import Stripe from "stripe";
import config from "../../config";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentValidation } from "../../validation/payment.validation";

const router = Router();
// Stripe config for make payment
export const { checkout, customers } = new Stripe(config.strip_secret_key!);

router
    .route("/create")
    .get(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
        validateRequest( PaymentValidation.makePayment ),
        PaymentController.createPayment
    )




router
    .route("/success")
    .get(
        PaymentController.paymentSuccess
    )
    
router
    .route("/failed")
    .get(
        PaymentController.paymentCancelled
    )

    

export const PaymentRoute = router;