import { JwtPayload } from "jsonwebtoken"
import User from "../../model/user.model";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import Offer from "../../model/offer.model";
import Post from "../../model/post.model";

// Need more oparation for the best responce
const overview = async (
    payload: JwtPayload
) => {
    const { userID } = payload;
    const user = await User.findById(userID);
    if ( user ) {
        throw new ApiError(StatusCodes.NOT_FOUND,"Admin not founded!")
    };

    const totalUser = await User.find({});
    const totalJobRequest = await Offer.find({});
    const totalJobPost = await Post.find({});
    const totalRevenue = user.accountBalance;

    return {
        totalJobPost,
        totalJobRequest,
        totalUser,
        totalRevenue
    } // total Users, Revenue, Job Request, Job post
}

export const AdminService = {
    overview
}