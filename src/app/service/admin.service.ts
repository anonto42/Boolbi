import { JwtPayload } from "jsonwebtoken"
import User from "../../model/user.model";
import ApiError from "../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { subDays, startOfDay, addDays } from "date-fns";
import Offer from "../../model/offer.model";
import Post from "../../model/post.model";
import Payment from "../../model/payment.model";
import { ACCOUNT_STATUS, ACCOUNT_VERIFICATION_STATUS, USER_ROLES } from "../../enums/user.enums";
import Catagroy from "../../model/catagory.model";
import Announcement from "../../model/announcement.model";
import { bcryptjs } from "../../helpers/bcryptHelper";
import Support from "../../model/support.model";
import SubCatagroy from "../../model/subCategory.model";
import unlinkFile from "../../shared/unlinkFile";
import Verification from "../../model/verifyRequest.model";
import Notification from "../../model/notification.model";
import { PAYMENT_STATUS } from "../../enums/payment.enum";
import Order from "../../model/order.model";
import { PaginationParams } from "../../types/user";
import mongoose from "mongoose";

const overview = async (
    payload: JwtPayload
) => {
    const { userID } = payload;
    const user = await User.findById(userID);
    if ( !user ) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Admin not founded!"
      )
    };

    const totalUser = await User.find().countDocuments();
    const totalJobRequest = await Offer.find().countDocuments();
    const totalJobPost = await Post.find().countDocuments();
    const totalCommission = await Payment.aggregate([
      { $match: { status: PAYMENT_STATUS.SUCCESS } },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: "$commission" }
        }
      }
    ]);
    const commissionSum = totalCommission[0]?.totalCommission || 0;

    const currentYear = new Date().getFullYear();

    const result = await Payment.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lt: new Date(`${currentYear + 1}-01-01`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalCommission: { $sum: "$commission" }
        }
      }
    ]);

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Convert aggregation result to a map for fast access
    const commissionMap = new Map<number, number>();
    result.forEach(entry => {
      commissionMap.set(entry._id, entry.totalCommission);
    });

    // Build the final array format
    const formattedData = months.map((monthName, index) => ({
      month: monthName,
      commission: commissionMap.get(index + 1) || 0
    }));

    const today = startOfDay(new Date());
    const lastWeek = subDays(today, 6);

    const data = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: lastWeek,
            $lte: addDays(today, 1)
          },
          role: { $in: [ USER_ROLES.USER, USER_ROLES.SERVICE_PROVIDER] }
        }
      },
      {
        $project: {
          role: 1,
          day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
        }
      },
      {
        $group: {
          _id: { day: "$day", role: "$role" },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.day",
          roles: {
            $push: {
              role: "$_id.role",
              count: "$count"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          day: "$_id",
          serviceProvider: {
            $let: {
              vars: {
                sp: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$roles",
                        as: "item",
                        cond: { $eq: ["$$item.role", "serviceProvider"] }
                      }
                    },
                    0
                  ]
                }
              },
              in: { $ifNull: ["$$sp.count", 0] }
            }
          },
          categoryUser: {
            $let: {
              vars: {
                cu: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$roles",
                        as: "item",
                        cond: { $eq: ["$$item.role", "categoryUser"] }
                      }
                    },
                    0
                  ]
                }
              },
              in: { $ifNull: ["$$cu.count", 0] }
            }
          }
        }
      },
      {
        $sort: { day: 1 }
      }
    ]);

    return {
        totalJobPost,
        totalJobRequest,
        totalUser,
        totalRevenue: commissionSum,
        yearlyRevenueData: formattedData,
        userJoined: data
    };
}

const engagementData = async (
  year : string
) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const numericYear = parseInt(year);

    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(`${numericYear}-01-01T00:00:00Z`),
            $lt: new Date(`${numericYear + 1}-01-01T00:00:00Z`)
          }
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          count: { $sum: 1 }
        }
      }
    ];

    const [userCounts, orderCounts] = await Promise.all([
      User.aggregate(pipeline),
      Order.aggregate(pipeline)
    ]);

    const userMap = new Map(userCounts.map(item => [item._id, item.count]));
    const orderMap = new Map(orderCounts.map(item => [item._id, item.count]));

    const result = months.map((monthName, index) => {
      const monthIndex = index + 1;
      return {
        month: monthName,
        userCount: userMap.get(monthIndex) || 0,
        orderCount: orderMap.get(monthIndex) || 0
      };
    });

    return result
}

const allCustomers = async (
  payload: JwtPayload,
  params: PaginationParams = {}
) => {
  const { userID } = payload;
  const { page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const isAdmin = await User.findById(userID);
  if (!isAdmin || (isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
  }

  const total = await User.countDocuments({ role: "USER" });

  const allUsers = await User.aggregate([
    { $match: { role: "USER" } },
    {
      $project: {
        _id: 1,
        fullName: 1,
        email: 1,
        accountStatus: 1,
        deviceID: 1,
        createdAt: 1,
        updatedAt: 1
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit }
  ]);

  return {
    data: allUsers,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit)
  };
};

const aCustomer = async (
    payload: JwtPayload,
    customerID: string
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin || ( isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
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
    if (!isAdmin || ( isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
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
  payload: JwtPayload,
  params: PaginationParams = {}
) => {
  const { userID } = payload;
  const { page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const isAdmin = await User.findById(userID);
  if (!isAdmin || (isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
  }

  const total = await User.countDocuments({ role: "SERVICE_PROVIDER" });

  const allServiceProviders = await User.aggregate([
    { $match: { role: "SERVICE_PROVIDER" } },
    {
      $project: {
        _id: 1,
        fullName: 1,
        email: 1,
        accountStatus: 1,
        deviceID: 1,
        createdAt: 1,
        updatedAt: 1,
        category: 1
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit }
  ]);

  return {
    data: allServiceProviders,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit)
  };
};

const allPayments = async (
  payload: JwtPayload,
  params: PaginationParams = {}
) => {
  const { userID } = payload;
  const { page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const isAdmin = await User.findById(userID);
  if (!isAdmin || (isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
  }

  const total = await Payment.countDocuments();

  const allPayments = await Payment.find({})
    .populate("userId","fullName email phone")
    .populate("orderId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    data: allPayments,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit)
  };
};

const APayments = async (
    payload: JwtPayload,
    paymentID: string
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin || ( isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
    };
    
    const allPayments = await Payment.findById(paymentID).populate("userId","fullName email").populate("orderId");

    return allPayments;
}

const allCatagorys = async (
    payload: JwtPayload,
    pagination: {
      page: number,
      limit: number
    }
) => {
    const { page= 1, limit= 10 } = pagination;
    const { userID } = payload;
    const objID = new mongoose.Types.ObjectId(userID);
    
    const isUserExist = await User.findById(objID);
    
    if (!isUserExist) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "User not found!"
      )
    }
    if (
      isUserExist.accountStatus === ACCOUNT_STATUS.DELETE ||
      isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK
    ) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        `Your account was ${isUserExist.accountStatus.toLowerCase()}!`
      );
    }

    const skip = ( page - 1 ) * limit;
    
    const categories = await Catagroy.aggregate([
      {
        $lookup: {
          from: "subcatagories",
          localField: "subCatagroys",
          foreignField: "_id",
          as: "subCategories"
        }
      },
      {
        $project:{
          subCatagroys: 0
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ]);
    
    return categories
}

const addNewCatagory = async (
  payload: JwtPayload,
  image: string,
  catagoryName: string
) => {
    try {
      const { userID } = payload;
      const isAdmin = await User.findById(userID);
      if (!isAdmin || ( isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
          throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
      };
      if (!image || !catagoryName) {
          throw new ApiError(StatusCodes.BAD_REQUEST,"You should give all the required details to create a new catagory!")
      };
      const catagoryModel = await Catagroy.findOne({name: catagoryName});
      if (catagoryModel) {
          throw new ApiError(StatusCodes.BAD_REQUEST,`${catagoryName} is already exist your can't add this`)
      };
  
      const newCatagory = Catagroy.create({
        name: catagoryName,
        image
      })
  
      return newCatagory;
    } catch (error) {
      unlinkFile(image);
    }
}

const addSubCatagorys = async (
  payload: JwtPayload,
  subCatagoryName: string,
  catagoryID: string
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin || ( isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
    };
    if (!catagoryID || !subCatagoryName) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"You should give all the required details to create a new catagory!")
    };
    const catagoryModel = await Catagroy.findOne({_id: catagoryID});
    if (!catagoryModel) {
        throw new ApiError(StatusCodes.NOT_FOUND,`Catagory not founded!`)
    };

    const newCatagory = await SubCatagroy.create({
      categoryId: catagoryID,
      name: subCatagoryName
    });

    catagoryModel.subCatagroys.push((newCatagory as any)._id);
    await catagoryModel.save()

    return newCatagory;
}

const deleteSubCatagory = async (
    payload: JwtPayload,
    catagoryId: string,
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin || ( isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
    };
    if ( catagoryId ) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"You should give the catagory id for delete!")
    };
    const subCatagoryModel = await SubCatagroy.findOneAndDelete({_id: catagoryId});
    if (!subCatagoryModel) {
        throw new ApiError(StatusCodes.NOT_FOUND,"Your giver catagory not exist!")
    };

    return subCatagoryModel;
}

const deleteCatagory = async (
    payload: JwtPayload,
    catagoryId: string,
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin || ( isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
    };
    if ( catagoryId ) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"You should give the catagory id for delete!")
    };
    const catagoryModel = await Catagroy.findOneAndDelete({_id: catagoryId});
    unlinkFile((catagoryModel as any).image)
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
  },
  image?: string
) => {
  try {
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
  
    if (image && image !== catagoryModel.image) {
      unlinkFile(catagoryModel.image)
      catagoryModel.image = image;
    }
  
    await catagoryModel.save();
  
    return catagoryModel;
  } catch (error) {
    if (image) unlinkFile(image)
  }
};

const updateSubCatagory = async (
  payload: JwtPayload,
  data: {
    name?: string;
    id: string;
  }
) => {
  const { userID } = payload;

  const isAdmin = await User.findById(userID);
  if (!isAdmin || (isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Access denied. Admin only.");
  }

  const catagoryModel = await SubCatagroy.findById(data.id);
  if (!catagoryModel) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category does not exist!");
  }

  if (data.name && data.name !== catagoryModel.name) {
    catagoryModel.name = data.name;
  }
  await catagoryModel.save();

  return catagoryModel;
};

const announcements = async (
  payload: JwtPayload,
  page = 1,
  limit = 10
) => {
  const { userID } = payload;
  const isAdmin = await User.findById(userID);

  if (!isAdmin) {
    throw new ApiError(StatusCodes.EXPECTATION_FAILED, "User not found");
  }

  if (
    isAdmin.accountStatus === ACCOUNT_STATUS.DELETE ||
    isAdmin.accountStatus === ACCOUNT_STATUS.BLOCK
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      `Your account was ${isAdmin.accountStatus.toLowerCase()}!`
    );
  }

  const skip = (page - 1) * limit;

  const [announcements, total] = await Promise.all([
    Announcement.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Announcement.countDocuments()
  ]);

  return {
    data: announcements,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};

const singleAnnouncement = async (
    payload: JwtPayload,
    announcementID: string
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin) {
        throw new ApiError(StatusCodes.EXPECTATION_FAILED,"User not founded")
    }
    if (
      isAdmin.accountStatus === ACCOUNT_STATUS.DELETE ||
      isAdmin.accountStatus === ACCOUNT_STATUS.BLOCK
    ) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        `Your account was ${isAdmin.accountStatus.toLowerCase()}!`
      );
    }

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

    const message = {notificationType:"Announcement", title: data.title, descriptions: data.descriptions}
    
    //@ts-ignore
    const io = global.io
    io.emit("socket:announcement",message)

    const newAnounce = await Announcement.create({title: data.title, descriptions: data.descriptions,})

    return newAnounce
}

const deleteAnnouncement = async (
    payload: JwtPayload,
    announceID: string
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin || ( isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
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

const statusAnnounsments = async (
  payload: JwtPayload,
  id: string,
  acction: "ACTIVE" | "DEACTIVE"
) => {
  const { userID } = payload;

  const isAdmin = await User.findById(userID);
  if (!isAdmin || (isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Access denied. Admin only.");
  }

  const ANNOUNSMENT = await Announcement.findByIdAndUpdate(id,{status: acction});
  if (!ANNOUNSMENT) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Announcement does not exist!");
  }

  return ANNOUNSMENT;
};

const privacyPolicy = async (
  payload: JwtPayload,
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin) {
        throw new ApiError(StatusCodes.EXPECTATION_FAILED,"User not founded")
    }
    if (
      isAdmin.accountStatus === ACCOUNT_STATUS.DELETE ||
      isAdmin.accountStatus === ACCOUNT_STATUS.BLOCK
    ) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        `Your account was ${isAdmin.accountStatus.toLowerCase()}!`
      );
    }

    const privacyPolicy = await User.findOne({role: USER_ROLES.SUPER_ADMIN});
    if (!privacyPolicy) {
        throw new ApiError(StatusCodes.NOT_FOUND, "PrivacyPolicy does not exist!");
    }

    return privacyPolicy.privacyPolicy;
};

const editePrivacyPolicy = async (
  payload: JwtPayload,
  data: string
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin) {
        throw new ApiError(StatusCodes.EXPECTATION_FAILED,"User not founded")
    }
    if (!isAdmin || (isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Access denied. Admin only.");
    }
    if (
      isAdmin.accountStatus === ACCOUNT_STATUS.DELETE ||
      isAdmin.accountStatus === ACCOUNT_STATUS.BLOCK
    ) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        `Your account was ${isAdmin.accountStatus.toLowerCase()}!`
      );
    }

    const privacyPolicy = await User.findOne({role: USER_ROLES.SUPER_ADMIN});
    if (!privacyPolicy) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Privacy Policy does not exist!");
    }

    privacyPolicy.privacyPolicy = data;
    await privacyPolicy.save();

    return data;
};

const conditions = async (
  payload: JwtPayload,
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin) {
        throw new ApiError(StatusCodes.EXPECTATION_FAILED,"User not founded")
    }
    if (
      isAdmin.accountStatus === ACCOUNT_STATUS.DELETE ||
      isAdmin.accountStatus === ACCOUNT_STATUS.BLOCK
    ) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        `Your account was ${isAdmin.accountStatus.toLowerCase()}!`
      );
    }

    const termsConditions = await User.findOne({role: USER_ROLES.SUPER_ADMIN});
    if (!termsConditions) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Terms & Conditions dose not exist!");
    }

    return termsConditions.termsConditions;
};

const editeConditions = async (
  payload: JwtPayload,
  data: string
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin) {
        throw new ApiError(StatusCodes.EXPECTATION_FAILED,"User not founded")
    }
    if (!isAdmin || (isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
        throw new ApiError(StatusCodes.FORBIDDEN, "Access denied. Admin only.");
    }
    if (
      isAdmin.accountStatus === ACCOUNT_STATUS.DELETE ||
      isAdmin.accountStatus === ACCOUNT_STATUS.BLOCK
    ) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        `Your account was ${isAdmin.accountStatus.toLowerCase()}!`
      );
    }

    const termsConditions = await User.findOne({role: USER_ROLES.SUPER_ADMIN});
    if (!termsConditions) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Terms & Conditions does not exist!");
    }

    termsConditions.termsConditions = data;
    await termsConditions.save();

    return data;
};

const allAdmins = async (
  payload: JwtPayload,
  params: PaginationParams = {}
) => {
  const { userID } = payload;
  const { page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const isAdmin = await User.findById(userID);
  if (!isAdmin) {
    throw new ApiError(StatusCodes.EXPECTATION_FAILED, "User not found");
  }

  if (
    isAdmin.accountStatus === ACCOUNT_STATUS.DELETE ||
    isAdmin.accountStatus === ACCOUNT_STATUS.BLOCK
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      `Your account was ${isAdmin.accountStatus.toLowerCase()}!`
    );
  }

  const total = await User.countDocuments({
    role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] }
  });

  const admins = await User.find({
    role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] }
  })
    .select("-password -isSocialAccount -isVerified -otpVerification -termsConditions -privacyPolicy -__v -accountBalance -samplePictures -orders -myOffer -iOffered -favouriteServices -job")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    data: admins,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit)
  };
};

const addNewAdmin = async (
  payload: JwtPayload,
  {
    fullName,
    email,
    password
  }:{
    fullName: string,
    email: string,
    password: string
  }
) => {
    const { userID, role } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin) {
        throw new ApiError(StatusCodes.EXPECTATION_FAILED,"User not founded")
    }
    if ( role === USER_ROLES.ADMIN || isAdmin.role === USER_ROLES.ADMIN) {
      throw new ApiError(StatusCodes.METHOD_NOT_ALLOWED,"You are not authorize to do that acction")
    }
    if (
      isAdmin.accountStatus === ACCOUNT_STATUS.DELETE ||
      isAdmin.accountStatus === ACCOUNT_STATUS.BLOCK
    ) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        `Your account was ${isAdmin.accountStatus.toLowerCase()}!`
      );
    }
    const isAdminExist = await User.findOne({email: email});
    if (isAdminExist) {
      throw new ApiError(StatusCodes.UNAUTHORIZED,"Already a user exist using this email: "+email)
    };

    const hasedPassword = await bcryptjs.Hash(password);
    const admin = await User.create({fullName,email,password:hasedPassword,role: USER_ROLES.ADMIN});

    return {
      role: admin.role,
      name: admin.fullName,
      email: admin.email,
      language: admin.language,
      userVerification: true
    }
};

const deleteAdmin = async (
    payload: JwtPayload,
    adminID: string
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin || ( isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
    };
    
    const admin = await User.findOneAndDelete({_id: adminID})
    if (!admin) {
      throw new ApiError(StatusCodes.NOT_FOUND,"Admin not founded");
    }
    return admin;
}

const allSupportRequests = async (
  payload: JwtPayload,
  params: PaginationParams = {}
) => {
  const { userID } = payload;
  const { page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const isAdmin = await User.findById(userID);
  if (
    !isAdmin || 
    (
      isAdmin.role !== USER_ROLES.ADMIN && 
      isAdmin.role !== USER_ROLES.SUPER_ADMIN
    )
  ) {
    throw new ApiError(
      StatusCodes.NOT_FOUND, 
      "Admin not found"
    );
  }

  const total = await Support.countDocuments();

  const supports = await Support.find()
    .populate({ path: 'for', select: 'fullName email' })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();

  return {
    data: supports,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit)
  };
};

const giveSupport = async (
    payload: JwtPayload,
    {
      supportID,
      reply
    }:{
      supportID: string,
      reply: string
    }
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (
      !isAdmin || 
      ( 
        isAdmin.role !== USER_ROLES.ADMIN && 
        isAdmin.role !== USER_ROLES.SUPER_ADMIN
      )
    ) {
      throw new ApiError(
        StatusCodes.NOT_FOUND, 
        "Admin not found"
      );
    };

    const supportUpdated = await Support.findByIdAndUpdate(
      supportID,
      {
        adminReply: reply, 
        status: "SOLVED"
      },{ new: true }
    );

    
    //@ts-ignore
    const io = global.io;
    const notification = await Notification.create({
      for: supportUpdated.for,
      content: `You got a replay from the support request!`
    });
        
    io.emit(`socket:${ supportUpdated.for }`, notification);

    if (!supportUpdated) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        "Not founded the support, something was wrong"
      )
    };
    
    return supportUpdated
}

const allVericifationRequestes = async (
  payload: JwtPayload,
  params: PaginationParams = {}
) => {
  const { userID } = payload;
  const { page = 1, limit = 10 } = params;
  const skip = (page - 1) * limit;

  const isAdmin = await User.findById(userID);
  if (
    !isAdmin ||
    (isAdmin.role !== USER_ROLES.ADMIN &&
     isAdmin.role !== USER_ROLES.SUPER_ADMIN)
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to perform this action."
    );
  }

  const total = await Verification.countDocuments();

  const verificationRequests = await Verification.find()
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  return {
    data: verificationRequests,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit)
  };
};

const aVerification = async (
  payload: JwtPayload,
  id: string
) => {
  const { userID } = payload;
  const isAdmin = await User.findById( userID );
  if (
    !isAdmin ||
    isAdmin.role !== USER_ROLES.ADMIN && 
    isAdmin.role !== USER_ROLES.SUPER_ADMIN   
  ) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "You are not available to do that!"
    )
  }
  if (!id) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You must give the id of the request"
    )
  }

  return await Verification.findById(id)
}

const intractVerificationRequest = async (
  payload: JwtPayload,
  requestId: string,
  acction: "APPROVE" | "DECLINE"
) => {
  const { userID } = payload;
  const isAdmin = await User.findById( userID );
  if (
    !isAdmin ||
    isAdmin.role !== USER_ROLES.ADMIN && 
    isAdmin.role !== USER_ROLES.SUPER_ADMIN   
  ) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "You are not availe to do that!"
    )
  }

  const request = await Verification.findById(requestId).populate("user");
  if (!request) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Request not founded!"
    )
  }
  
  //@ts-ignore
  const io = global.io;

  if ( acction === "APPROVE" ) {
    await User.findByIdAndUpdate( request.user , {
      $set: {
        "isVerified.status": ACCOUNT_VERIFICATION_STATUS.VERIFIED
      }
    })
    const notification = await Notification.create({
        for: request.user._id,
        content: `${request.user.fullName} your verificaiton request was approved`
    });
        
    io.emit(`socket:${ request.user._id }`, notification);

  } else if ( acction === "DECLINE" ) {
    await User.findByIdAndUpdate( request.user , {
      $set: {
        "isVerified.status": ACCOUNT_VERIFICATION_STATUS.UNVERIFIED
      }
    })
    const notification = await Notification.create({
        for: request.user._id,
        content: `${request.user.fullName} your verificaiton request was rejected!`
    });
        
    io.emit(`socket:${ request.user._id }`, notification);
  }

  return await Verification.find();
}

export const AdminService = {
    overview,
    engagementData,
    allCustomers,
    intractVerificationRequest,
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
    updateAnnounsments,
    statusAnnounsments,
    privacyPolicy,
    aVerification,
    editePrivacyPolicy,
    conditions,
    editeConditions,
    allAdmins,
    addNewAdmin,
    deleteAdmin,
    allSupportRequests,
    giveSupport,
    addSubCatagorys,
    deleteSubCatagory,
    updateSubCatagory,
    allVericifationRequestes
}