import { JwtPayload } from "jsonwebtoken"
import User from "../../model/user.model";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import Offer from "../../model/offer.model";
import Post from "../../model/post.model";
import Payment from "../../model/payment.model";

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
    
    const result = await Payment.aggregate([
        {
            $match: {
            status: "SUCCESS",
            },
        },
        {
            $group: {
            _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
            },
            monthlyCommission: { $sum: "$commission" },
            },
        },
        {
            $sort: { "_id.year": 1, "_id.month": 1 }
        }
        ]);

        const totalRevenue = result.reduce((sum, item) => sum + item.monthlyCommission, 0);

        const monthlyRevenue = result.map(item => {
            const monthName = new Date(item._id.year, item._id.month - 1).toLocaleString("default", { month: "long" });
            return {
                month: monthName,
                year: item._id.year,
                revenue: item.monthlyCommission,
            };
        });
    

    return {
        totalJobPost,
        totalJobRequest,
        totalUser,
        totalRevenue:{
            totalRevenue,
            monthlyRevenue
        }
    };
}

export const AdminService = {
    overview
}