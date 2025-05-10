import { JwtPayload } from "jsonwebtoken"
import { offer } from "../../types/provider"
import User from "../../model/user.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError";
import { ACCOUNT_STATUS } from "../../enums/user.enums";
import Offer from "../../model/offer.model";


const offerCreation = async (
    payload: JwtPayload,
    data: offer
) => {
    const { budget, catagory, companyName, description, jobID, projectName } = data;
    const { userID } = payload;
    
    const isExist = await User.findOne({_id: userID})
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_FOUND,"User not exist!")
    };

    if ( isExist.accountStatus === ACCOUNT_STATUS.DELETE || isExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isExist.accountStatus.toLowerCase()}!`)
    };

    const offerData = {
        budget,
        catagory,
        companyName,
        description,
        jobID,
        projectName,
        companyImages: []
    }

    const offer = await Offer.create(offerData);

    return offer
}



export const ProviderService = {
    offerCreation,
}