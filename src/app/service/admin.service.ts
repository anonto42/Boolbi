import { JwtPayload } from "jsonwebtoken"
import User from "../../model/user.model";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import Offer from "../../model/offer.model";
import Post from "../../model/post.model";
import Payment from "../../model/payment.model";
import { ACCOUNT_STATUS, USER_ROLES } from "../../enums/user.enums";
import Catagroy from "../../model/catagory.model";
import Announcement from "../../model/announcement.model";

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

const deleteCatagory = async (
    payload: JwtPayload,
    catagoryId: string,
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin || isAdmin.role !== USER_ROLES.ADMIN || isAdmin.role !== USER_ROLES.SUPER_ADMIN) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
    };
    if ( catagoryId ) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"You should give the catagory id for delete!")
    };
    const catagoryModel = await Catagroy.findOneAndDelete({_id: catagoryId});
    if (!catagoryModel) {
        throw new ApiError(StatusCodes.NOT_FOUND,"Your giver catagory not exist!")
    };

    return catagoryModel;
}

const updateCatagory = async (
  payload: JwtPayload,
  data: {
    name?: string;
    id: string;
    subCatagorys?: string;
  },
  image?: string
) => {
  const { userID } = payload;

  const isAdmin = await User.findById(userID);
  if (!isAdmin || (isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Access denied. Admin only.");
  }

  const catagoryModel = await Catagroy.findById(data.id);
  if (!catagoryModel) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category does not exist!");
  }

  if (data.name && data.name !== catagoryModel.name) {
    catagoryModel.name = data.name;
  }

  if (data.subCatagorys && data.subCatagorys !== catagoryModel.subCatagorys) {
    catagoryModel.subCatagorys = data.subCatagorys;
  }

  if (image && image !== catagoryModel.image) {
    catagoryModel.image = image;
  }

  await catagoryModel.save();

  return catagoryModel;
};

const announcements = async (
    payload: JwtPayload
) => {
    const { userID } = payload
    const isAdmin = await User.findById(userID);
    if (!isAdmin || (isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
        throw new ApiError(StatusCodes.FORBIDDEN, "Access denied. Admin only.");
    }

    const catagoryModel = await Catagroy.findById(isAdmin._id);
    if (!catagoryModel) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Category does not exist!");
    }
}

const singleAnnouncement = async (
    payload: JwtPayload,
    announcementID: string
) => {
    const { userID } = payload
    const isAdmin = await User.findById(userID);
    if (!isAdmin || (isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
        throw new ApiError(StatusCodes.FORBIDDEN, "Access denied. Admin only.");
    };

    const announcement = await Announcement.findById(announcementID);
    if (!announcement) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Announcement does not exist!");
    };

    return announcement
}

const createAnnouncement = async (
    payload: JwtPayload,
    data: {
        title: string,
        descriptions: string
    }
) => {
    const { userID } = payload
    const isAdmin = await User.findById(userID);
    if (!isAdmin || (isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
        throw new ApiError(StatusCodes.FORBIDDEN, "Access denied. Admin only.");
    };

    const announcement = await Announcement.findOne({title: data.title});
    if (announcement) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Already announcement exist!");
    };

    const newAnounce = await Announcement.create({title: data.title, descriptions: data.descriptions,})

    return newAnounce
}

const deleteAnnouncement = async (
    payload: JwtPayload,
    announceID: string
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin || isAdmin.role !== USER_ROLES.ADMIN || isAdmin.role !== USER_ROLES.SUPER_ADMIN) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
    };
    if ( announceID ) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"You should give the id for delete!")
    };
    const catagoryModel = await Announcement.findOneAndDelete({_id: announceID});
    if (!catagoryModel) {
        throw new ApiError(StatusCodes.NOT_FOUND,"Your giver announcement is not exist!")
    };

    return catagoryModel;
}

const updateAnnounsments = async (
  payload: JwtPayload,
  data: {
    title?: string;
    id: string;
    descriptions?: string;
  }
) => {
  const { userID } = payload;

  const isAdmin = await User.findById(userID);
  if (!isAdmin || (isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Access denied. Admin only.");
  }

  const catagoryModel = await Announcement.findById(data.id);
  if (!catagoryModel) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Announcement does not exist!");
  }

  if (data.title && data.title !== catagoryModel.title) {
    catagoryModel.title = data.title;
  }

  if (data.descriptions && data.descriptions !== catagoryModel.descriptions) {
    catagoryModel.descriptions = data.descriptions;
  }

  await catagoryModel.save();

  return catagoryModel;
};

export const AdminService = {
    overview,
    allCustomers,
    aCustomer,
    updateUserAccountStatus,
    allProvider,
    allPayments,
    APayments,
    allCatagorys,
    addNewCatagory,
    deleteCatagory,
    updateCatagory,
    announcements,
    singleAnnouncement,
    createAnnouncement,
    deleteAnnouncement,
    updateAnnounsments
}