import { JwtPayload } from "jsonwebtoken"
import User from "../../model/user.model";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import Offer from "../../model/offer.model";
import Post from "../../model/post.model";
import Payment from "../../model/payment.model";
import { ACCOUNT_STATUS, USER_ROLES } from "../../enums/user.enums";
import Catagroy from "../../model/catagory.model";

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

const allCustomers = async (
    payload: JwtPayload 
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin || isAdmin.role !== USER_ROLES.ADMIN || isAdmin.role !== USER_ROLES.SUPER_ADMIN) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
    };
    
    const allUser = await User.find({role: "USER"});

    return allUser;
}

const aCustomer = async (
    payload: JwtPayload,
    customerID: string
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin || isAdmin.role !== USER_ROLES.ADMIN || isAdmin.role !== USER_ROLES.SUPER_ADMIN) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
    };
    if (!customerID) {
        throw new ApiError(StatusCodes.BAD_GATEWAY,"You must give the customer id to get the customer")
    };

    return await User.findById(customerID)
}

const updateUserAccountStatus = async (
    payload: JwtPayload,
    customerID: string,
    acction: ACCOUNT_STATUS.ACTIVE | ACCOUNT_STATUS.BLOCK | ACCOUNT_STATUS.DELETE | ACCOUNT_STATUS.REPORT
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin || isAdmin.role !== USER_ROLES.ADMIN || isAdmin.role !== USER_ROLES.SUPER_ADMIN) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
    };
    const customer = await User.findById(customerID);
    if (!customer) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"Customer not exist")
    };

    customer.accountStatus = acction;
    await customer.save();

    return true;

}

const allProvider = async (
    payload: JwtPayload 
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin || isAdmin.role !== USER_ROLES.ADMIN || isAdmin.role !== USER_ROLES.SUPER_ADMIN) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
    };
    
    const allUser = await User.find({role: "SERVICE_PROVIDER"});

    return allUser;
}

const allPayments = async (
    payload: JwtPayload 
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin || isAdmin.role !== USER_ROLES.ADMIN || isAdmin.role !== USER_ROLES.SUPER_ADMIN) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
    };
    
    const allPayments = await Payment.find({});

    return allPayments;
}

const APayments = async (
    payload: JwtPayload,
    paymentID: string
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin || isAdmin.role !== USER_ROLES.ADMIN || isAdmin.role !== USER_ROLES.SUPER_ADMIN) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
    };
    
    const allPayments = await Payment.findById(paymentID);

    return allPayments;
}

const allCatagorys = async (
    payload: JwtPayload 
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin || isAdmin.role !== USER_ROLES.ADMIN || isAdmin.role !== USER_ROLES.SUPER_ADMIN) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
    };
    
    const catagroys = await Catagroy.find({});

    return catagroys;
}

const addNewCatagory = async (
    payload: JwtPayload,
    image: string,
    data: {
        catagory: string,
        subCatagory: string
    }
) => {
    const { userID } = payload;
    const { catagory, subCatagory} = data;
    const isAdmin = await User.findById(userID);
    if (!isAdmin || isAdmin.role !== USER_ROLES.ADMIN || isAdmin.role !== USER_ROLES.SUPER_ADMIN) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
    };
    if (!image || !catagory || !subCatagory ) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"You should give all the required details to create a new catagory!")
    };
    const catagoryModel = await Catagroy.findOne({name: catagory});
    if (catagoryModel) {
        throw new ApiError(StatusCodes.BAD_REQUEST,`${catagory} is already exist your can't add this`)
    };

    const newCatagory = Catagroy.create({
        catagory,
        subCatagory,
        image
    })

    return newCatagory;
}



export const AdminService = {
    overview,
    allCustomers,
    aCustomer,
    updateUserAccountStatus,
    allProvider,
    allPayments,
    APayments,
    allCatagorys,
    addNewCatagory
}