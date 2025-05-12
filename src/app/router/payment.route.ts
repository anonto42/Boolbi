import { Router } from "express";
import auth from "../../middlewares/Auth.middleware";
import { USER_ROLES } from "../../enums/user.enums";
import { PaymentController } from "../controller/payment.controller";
import Stripe from "stripe";
import config from "../../config";

const router = Router();
// Stripe config for make payment
export const { customers, tokens, charges } = new Stripe(config.strip_secret_key!);

router
    .route("/create")
    .post(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
        PaymentController.createPayment
    )
    
router
    .route("/add")
    .post(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
        PaymentController.addCard
    )
    
router
    .route("/make")
    .post(
        auth( USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
        PaymentController.createCharges
    )

    

export const PaymentRoute = router;