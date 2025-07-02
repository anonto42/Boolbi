import { JwtPayload } from "jsonwebtoken"
import User from "../../model/user.model";
import { StatusCodes } from "http-status-codes";
import { ACCOUNT_STATUS, USER_ROLES } from "../../enums/user.enums";
import ApiError from "../../errors/ApiError";
import { accounts, checkout, customers, paymentIntents, transfers } from "../router/payment.route";
import Order from "../../model/order.model";
import { paymentSuccessfull } from "../../shared/paymentTemplate";

const createSession = async (
    payload: JwtPayload,
    host: string,
    protocol: string
) => {
    const { userID } = payload;
    const isUser = await User.findById(userID);
    
    if (!isUser) {
        throw new ApiError(StatusCodes.NOT_FOUND, `No account exists!`);
    }

    if (
        isUser.accountStatus === ACCOUNT_STATUS.DELETE ||
        isUser.accountStatus === ACCOUNT_STATUS.BLOCK
    ) {
        throw new ApiError(StatusCodes.FORBIDDEN, `Your account was ${isUser.accountStatus.toLowerCase()}!`);
    }

    let customer;

    if (!isUser.paymentCartDetails.customerID) {
        const internal_customer = await customers.create({
            name: isUser.fullName,
            email: isUser.email,
            metadata: { userID: isUser._id },
        });

        if (!internal_customer) {
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create the customer on Stripe!");
        };

        customer = internal_customer;

        // isUser.paymentCartDetails.customerID = customer.id;
        // await isUser.save();
    } else customer = isUser.paymentCartDetails.customerID;

    let account;
    if (!isUser.paymentCartDetails.accountID) {
        const internal_account = await accounts.create({
            type: "express",
            country: "US",
            email: isUser.email,
            capabilities: {
                transfers: { requested: true },
                card_payments: { requested: true },
            },
            business_type: "individual",
        });
        
        if (!internal_account) {
            throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create the Stripe Connect account!");
        }
        
        account = internal_account;
        // isUser.paymentCartDetails.accountID = account.id;
        // await isUser.save();
    } else isUser.paymentCartDetails.accountID;
    
    console.log({
        account,
        customer
    })

    const metadata = {
        userID : isUser._id.toString(),
        strip_customerID: customer == null ? null : customer.id,
        strip_accountID: account == null ? null : account.id
    }

    // Create checkout session
    const session = await checkout.sessions.create({
        mode: "setup",
        payment_method_types: ["card"],
        customer: isUser.paymentCartDetails.customerID.toString(),
        metadata: metadata,
        success_url: `${protocol}://${host}/api/v1/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${protocol}://${host}/api/v1/payment/failed?session_id={CHECKOUT_SESSION_ID}`,
    });

    return { session_url: session.url };
};

const chargeCustomer = async (
    payload: JwtPayload, 
    orderId: any
) => {
    const order = await Order.findById(orderId).populate("offerID");
    const user = await User.findById(order.offerID.to);

    if (!user || !user.paymentCartDetails.customerID) {
        throw new ApiError(StatusCodes.BAD_GATEWAY, "Customer doesn't have Stripe account details!");
    }
    if (!order) {
        throw new ApiError(StatusCodes.NOT_FOUND, "We didn't find the offer!");
    }

    // Charge customer
    const paymentIntent = await paymentIntents.create({
        amount: Math.round(order.offerID.budget * 100), // Convert to cents
        currency: 'usd',
        customer: user.paymentCartDetails.customerID,
        confirm: true,
        payment_method: 'pm_card_visa', // This should come from the session or front-end token
        automatic_payment_methods: { enabled: true },
    });

    if (paymentIntent.status !== 'succeeded') {
        throw new ApiError(StatusCodes.BAD_REQUEST, `Payment failed with status: ${paymentIntent.status}`);
    }

    return {
        status: paymentIntent.status,
        amount: paymentIntent.amount,
    };
};

const payoutToUser = async (
    payload: JwtPayload, 
    orderID: any
) => {
    const { userID } = payload;
    if (!orderID) {
        throw new ApiError(StatusCodes.NOT_FOUND, "You must provide the order id for the payment when it's complete!");
    }

    const user = await User.findById(userID);
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
    }

    const order = await Order.findById(orderID).populate("offerID", "budget");
    if (!order) {
        throw new ApiError(StatusCodes.BAD_GATEWAY, "We didn't find the order to pay you back!");
    }

    if (!order.isProgressDone) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "You haven't completed the order process!");
    }

    if (!user.paymentCartDetails.customerID) {
        throw new ApiError(StatusCodes.EXPECTATION_FAILED, "We didn't find your payment method!");
    }

    // Create transfer to user
    const transfer = await transfers.create({
        amount: Math.round(order.offerID.budget * 100), // Convert to cents
        currency: 'usd',
        destination: user.paymentCartDetails.customerID,
    });

    if (!transfer) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to transfer funds to the user!");
    }

    return transfer;
};

const confirmSessionOFStripe = async (
    sessionToken: string
) => {

    if (!sessionToken) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Session token is required to confirm the session!");
    }

    // Retrieve session details
    const session = await checkout.sessions.retrieve(sessionToken);

    console.log(session)

    // if (!session) {
    //     throw new ApiError(StatusCodes.NOT_FOUND, "Session not found!");
    // }

    // if ((session as any).setup_status !== 'succeeded') {
    //     throw new ApiError(StatusCodes.BAD_REQUEST, "Session setup failed!");
    // }

    // // Update user record with new payment method
    // const user = await User.findById(userID);
    // if (!user) {
    //     throw new ApiError(StatusCodes.NOT_FOUND, "User not found!");
    // }

    // user.paymentCartDetails.paymentMethod = (session as any).payment_method;
    // await user.save();

    return paymentSuccessfull;
};

export const PaymentService = {
    createSession,
    chargeCustomer,
    payoutToUser,
    confirmSessionOFStripe
};