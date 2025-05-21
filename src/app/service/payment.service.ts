import { JwtPayload } from "jsonwebtoken"
import User from "../../model/user.model";
import { StatusCodes } from "http-status-codes";
import { ACCOUNT_STATUS } from "../../enums/user.enums";
import ApiError from "../../errors/ApiError";
import { checkout, customers } from "../router/payment.route";
import Payment from "../../model/payment.model";
import { PAYMENT_STATUS } from "../../enums/payment.enum";
import Offer from "../../model/offer.model";
import mongoose from "mongoose";
import { paymentSuccessfull } from "../../shared/paymentTemplate";
import Order from "../../model/order.model";


const createCheckOut = async (
    payload: JwtPayload,
    host: string,
    protocol: string,
    offerId: any
) => {
    if (! offerId) {
        throw new ApiError(
            StatusCodes.PAYMENT_REQUIRED,
            "You must give the offer id of proses next!"
        )
    }
    const {userID} =  payload;
    const isUser = await User.findById(userID);
    if (!isUser) {
        throw new ApiError(StatusCodes.NOT_FOUND,`No account exists!`)
    };
    if ( isUser.accountStatus === ACCOUNT_STATUS.DELETE || isUser.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUser.accountStatus.toLowerCase()}!`)
    };
    const offerObjectID = new mongoose.Types.ObjectId( offerId )
    const offer = await Offer.findById( offerObjectID );
    if (!offer) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "We don't found the offer to create the payment"
        )
    }

    if (!isUser.paymentCartDetails.customerID) {
        const customer = await customers.create({
            name: isUser.fullName,
            email: isUser.email
        });
        if (!customer) {
            throw new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to create the customer on the stripe!"
            )
        };
        isUser.paymentCartDetails.customerID = customer.id;
        await isUser.save();
    };

    const session = await checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
        {
            price_data: {
            currency: "usd",
            unit_amount: offer.budget * 100,
            },
            quantity: 1
        }
        ],
        metadata: {
            name: isUser.fullName,
            email: isUser.email,
            amount: offer.budget,
            userID: isUser._id.toString(), 
            offerId:  offerId
        },
        customer: isUser.paymentCartDetails.customerID.toString(),
        success_url: `${ protocol}://${ host}/api/v1/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${ protocol}://${ host}/api/v1/payment/failed?session_id={CHECKOUT_SESSION_ID}`
    })

    return { payment_url: session.url }
}

const paymentSuccess = async (
    session : string
) => {

    /**
     * name: isUser.fullName,
        email: isUser.email,
        amount: offer.budget,
        userID: isUser._id.toString(), 
        offerId:  offerId
     */
  const { metadata } = await checkout.sessions.retrieve( session );
  if (!metadata) {
    throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "This is not a valid request to validate the request!")
  };
  const user = await User.findById( metadata.userID );
  const offer = await Offer.findById( metadata.offerId );
  if ( !user || !offer ) {
    throw new ApiError(
        StatusCodes.BAD_GATEWAY,
        "Somthing was wrong so we don't accepet your order!"
    )
  };

  const order = await Order.create({
    offerID: offer._id
  })

  const payment = await Payment.create({
    userId: user._id,
    orderId: order._id
  })



  return paymentSuccessfull

}


export const PaymentService = {
    createCheckOut,
    paymentSuccess
}