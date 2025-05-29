import { JwtPayload } from "jsonwebtoken"
import User from "../../model/user.model";
import { StatusCodes } from "http-status-codes";
import { ACCOUNT_STATUS, USER_ROLES } from "../../enums/user.enums";
import ApiError from "../../errors/ApiError";
import { accounts, checkout, customers, paymentIntents, transfers } from "../router/payment.route";
import Order from "../../model/order.model";

const createSession = async (
    payload: JwtPayload,
    host: string,
    protocol: string
) => {
    const {userID} =  payload;
    const isUser = await User.findById(userID);
    if (!isUser) {
        throw new ApiError(StatusCodes.NOT_FOUND,`No account exists!`)
    };

    if ( 
        isUser.accountStatus === ACCOUNT_STATUS.DELETE || 
        isUser.accountStatus === ACCOUNT_STATUS.BLOCK 
    ) {
        throw new ApiError(
            StatusCodes.FORBIDDEN,
            `Your account was ${isUser.accountStatus.toLowerCase()}!`
        )
    };

    if (!isUser.paymentCartDetails.customerID) {
        const customer = await customers.create({
            name: isUser.fullName,
            email: isUser.email,
            metadata: {
                userID: isUser._id
            }
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

    if (
        isUser.role === USER_ROLES.SERVICE_PROVIDER &&
        !isUser.paymentCartDetails.accountID
    ) {

        const account = await accounts.create({
            type: "express",
            country: "US",
            email: isUser.email,
            capabilities: {
                transfers: {
                    requested: true
                },
                card_payments:{
                    requested: true
                }
            },
            business_type: "individual",
        });

        if (!account) {
            throw new ApiError(
                StatusCodes.INTERNAL_SERVER_ERROR,
                "Failed to create the Stripe Connect account!"
            );
        };

        isUser.paymentCartDetails.accountID = account.id;
        await isUser.save();
    }

    //Setup session
    const session = await checkout.sessions.create({
        mode: "setup",
        payment_method_types:[ "card" ],
        customer: isUser.paymentCartDetails.customerID.toString(),
        success_url: `${ protocol }://${ host }/api/v1/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${ protocol }://${ host }/api/v1/payment/failed?session_id={CHECKOUT_SESSION_ID}`
    })

    return { session_url: session.url }
}

const chargeCustomer = async (
    payload: JwtPayload,
    orderId: any
) => {
    
    const order = await Order.findById(orderId).populate("offerID");
    const user = await User.findById(order.offerID.to);
    if (!user || !user.paymentCartDetails.customerID) {
        throw new ApiError(
            StatusCodes.BAD_GATEWAY,
            "Customer don't have Stripe account details!"
        )
    };
    if (!order) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "We don't found the offer!"
        )
    };

    // Charge customer
    const paymentIntent = await paymentIntents.create({
      amount: Math.round(order.offerID.budget * 100),
      currency: 'usd',
      customer: user.paymentCartDetails.customerID,
      confirm: true,
      payment_method: 'pm_card_visa',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never"
      }
    });

    return {
        status: paymentIntent.status,
        amount: paymentIntent.amount
    }
};

const payoutToUser = async (
    payload: JwtPayload,
    orderID: any
) => {
    const { userID } = payload;
    if (!orderID) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "You must give the order id for the the payment when it complite!"
        )
    }
    const user = await User.findById(userID);
    if (!user) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "User not found!"
        )
    };
    const order = await Order.findById(orderID).populate("offerID","budget");
    if (!order) {
        throw new ApiError(
            StatusCodes.BAD_GATEWAY,
            "We don't found the order to pay you back!"
        )
    }

    if (!order.isProgressDone) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "You don't have complite the all process of the order!"
        )
    }

    if (!user.paymentCartDetails.customerID) {
        throw new ApiError(
            StatusCodes.EXPECTATION_FAILED,
            "We don't found your payment methord!"
        )
    };

    const transfer = await transfers.create({
      amount: Math.round(order.offerID.budget * 100),
      currency: 'usd',
      destination: user.paymentCartDetails.customerID
    });

    return transfer
};

export const PaymentService = {
    createSession,
    chargeCustomer,
    payoutToUser
};