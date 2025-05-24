import { Request, Response, Router } from "express";
import auth from "../../middlewares/Auth.middleware";
import { USER_ROLES } from "../../enums/user.enums";
import { PaymentController } from "../controller/payment.controller";
import Stripe from "stripe";
import config from "../../config";
import { cardAddedSuccessfull, errorOnPayment } from "../../shared/paymentTemplate";

const router = Router();
// Stripe config for make payment
export const { checkout, customers, paymentIntents, transfers } = new Stripe(config.strip_secret_key!);

router
    .route("/create")
    .post(
        auth( 
            USER_ROLES.USER, 
            USER_ROLES.SERVICE_PROVIDER, 
            USER_ROLES.ADMIN, 
            USER_ROLES.SUPER_ADMIN
        ),
        PaymentController.createSession
    )

router
    .route("/pay")
    .post(
        auth(
            USER_ROLES.SERVICE_PROVIDER,
            USER_ROLES.SUPER_ADMIN,
            USER_ROLES.ADMIN,
            USER_ROLES.USER
        ),
        PaymentController.chargeUser
    )

router
    .route("/salary")
    .post(
        auth(
            USER_ROLES.SERVICE_PROVIDER,
            USER_ROLES.SUPER_ADMIN,
            USER_ROLES.ADMIN,
            USER_ROLES.USER
        ),
        PaymentController.givesalary
    )

router
    .route("/success")
    .get( (req: Request, res: Response) => {
        res.send(cardAddedSuccessfull)
    })

router
    .route("/failed")
    .get((req: Request, res: Response) => {
        res.send(errorOnPayment)
    })
    

export const PaymentRoute = router;