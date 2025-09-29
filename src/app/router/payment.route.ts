import { Request, Response, Router } from "express";
import auth from "../../middlewares/Auth.middleware";
import { USER_ROLES } from "../../enums/user.enums";
import { PaymentController } from "../controller/payment.controller";
import Stripe from "stripe";
import config from "../../config";
import { errorOnPayment } from "../../shared/paymentTemplate";
import User from "../../model/user.model";
import mongoose from "mongoose";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";

const router = Router();

export const { checkout, customers, paymentIntents, transfers, accounts, accountLinks } = new Stripe(config.strip_secret_key!);

router
    .route("/pay")
    .post(
        auth(
            USER_ROLES.SERVICE_PROVIDER,
            USER_ROLES.SUPER_ADMIN,
            USER_ROLES.ADMIN,
            USER_ROLES.USER
        ),
        PaymentController.payForService
    )

router
    .route("/verify")
    .post(
        auth(
            USER_ROLES.SERVICE_PROVIDER,
            // USER_ROLES.SUPER_ADMIN,
            // USER_ROLES.ADMIN,
            // USER_ROLES.USER
        ),
        PaymentController.verifyUser
    )

router
    .route("/success/:id")
    .get(
        PaymentController.successFullSession
    )

router
    .route("/payment-success")
    .get(
        PaymentController.PaymentVerify
    )

router
    .route("/refresh/:id")
    .get(
        PaymentController.refreshSesstion
    )

router
    .route("/return")
    .get(async (req, res)=>{

        const { accountId, userId } = req.query;

        if (!userId && !accountId) {
            throw new ApiError(
                StatusCodes.BAD_GATEWAY,
                "We don't found the Details"
            )
        }
        const user = await User.findById( new mongoose.Types.ObjectId(userId as string) )
        user.paymentCartDetails.accountID
        await user.save();

        res.send("Successfully setup the account!")
    })

router
    .route("/failed")
    .get((req: Request, res: Response) => {
        res.send(errorOnPayment)
    })
    

export const PaymentRoute = router;