import { JwtPayload } from "jsonwebtoken"
import User from "../../model/user.model";
import { StatusCodes } from "http-status-codes";
import { ACCOUNT_STATUS } from "../../enums/user.enums";
import ApiError from "../../errors/ApiError";
import { charges, customers, tokens } from "../router/payment.route";
import Payment from "../../model/payment.model";
import { PAYMENT_STATUS } from "../../enums/payment.enum";


const createCustomer = async (
    payload: JwtPayload,
) => {
    const {userID} = payload;
    const isUser = await User.findById(userID);
    if (!isUser) {
        throw new ApiError(StatusCodes.NOT_FOUND,`No account exists!`)
    };
    if ( isUser.accountStatus === ACCOUNT_STATUS.DELETE || isUser.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUser.accountStatus.toLowerCase()}!`)
    };

    const customer = await customers.create({
        name: isUser.fullName,
        email: isUser.email
    });

    isUser.paymentCartDetails.customerID = customer.id;
    await isUser.save();

    return customer
}

const addCard = async (
    payload: JwtPayload,
    data: {
        card_holder_name: string;
        card_exp_year: string;
        card_exp_month: string;
        card_number: string;
        card_cvc: string;
    }
) => {
    const {userID} = payload;
    const { card_exp_month, card_exp_year, card_holder_name, card_number, card_cvc } = data;
    const isUser = await User.findById(userID);
    if (!isUser) {
        throw new ApiError(StatusCodes.NOT_FOUND,`No account exists!`)
    };
    if ( isUser.accountStatus === ACCOUNT_STATUS.DELETE || isUser.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUser.accountStatus.toLowerCase()}!`)
    };

    const card_token = await tokens.create({
        card:{
            name: card_holder_name,
            number: card_number,
            cvc: card_cvc,
            exp_year: card_exp_year,
            exp_month: card_exp_month,
        }
    });

    const card = await customers.createSource(isUser.paymentCartDetails.customerID,{
        source:`${card_token.id}`
    });

    isUser.paymentCartDetails.cardID = card.id;
    await isUser.save();

    return {cardID: card.id}
}

const makePayment = async (
    payload: JwtPayload,
    amount: number,
    orderID: string
) => {
    const {userID} = payload;
    const isUser = await User.findById(userID);
    if (!isUser) {
        throw new ApiError(StatusCodes.NOT_FOUND,`No account exists!`)
    };
    if ( isUser.accountStatus === ACCOUNT_STATUS.DELETE || isUser.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUser.accountStatus.toLowerCase()}!`)
    };
    
    const customerID = isUser.paymentCartDetails.customerID;
    const cardId = isUser.paymentCartDetails.cardID;
    if ( !customerID || !cardId ) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"You must configur your payment integration")
    };

    const charge = await charges.create({
        amount: amount*100,
        customer: customerID,
        source: cardId,
        receipt_email: isUser.email,
        currency: "USD"
    });

    const payment = await Payment.create({
        amount: charge.amount,
        orderId: orderID,
        userId: isUser._id,
        chargeID: charge.id,
        status: PAYMENT_STATUS.SUCCESS
    })

    return { charge, payment }

}


export const PaymentService = {
    createCustomer,
    addCard,
    makePayment
}