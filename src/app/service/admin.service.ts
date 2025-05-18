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
import { bcryptjs } from "../../helpers/bcryptHelper";
import Support from "../../model/support.model";
import { SubCatagroy } from "../../model/subCategory.model";
import unlinkFile from "../../shared/unlinkFile";

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
    if (!isAdmin || ( isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
    };
    
    const allUsers = await User.aggregate([
      {
        $match: { role: "USER" }
      },
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
      }
    ]);
    return allUsers;
}

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
    payload: JwtPayload 
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin || ( isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
    };
    
    const allServiceProviders = await User.aggregate([
      {
        $match: { role: "SERVICE_PROVIDER" }
      },
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
      }
    ]);
    return allServiceProviders;
}

const allPayments = async (
    payload: JwtPayload 
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin || ( isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
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
    if (!isAdmin || ( isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
    };
    
    const allPayments = await Payment.findById(paymentID);

    return allPayments;
}

const allCatagorys = async (
    payload: JwtPayload 
) => {
    const { userID } = payload;
    const isUserExist = await User.findById(userID);
    if (
      isUserExist.accountStatus === ACCOUNT_STATUS.DELETE ||
      isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK
    ) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        `Your account was ${isUserExist.accountStatus.toLowerCase()}!`
      );
    }
    
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
      }
    ]);
    
    return categories
}

const addNewCatagory = async (
  payload: JwtPayload,
  image: string,
  catagoryName: string
) => {
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
    payload: JwtPayload
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

    const catagoryModel = await Announcement.find({});
    if (!catagoryModel) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Category does not exist!");
    };

    return catagoryModel;
}

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

    const admins = await User.findOne({role: USER_ROLES.ADMIN});

    return admins
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

    const hasedPassword = await bcryptjs.Hash(password);

    return await User.create({fullName,email,password:hasedPassword,role: USER_ROLES.ADMIN});
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
    payload: JwtPayload
) => {
    const { userID } = payload;
    const isAdmin = await User.findById(userID);
    if (!isAdmin || ( isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
    };
    
    const supports = await Support.find()
        .populate({ path: 'from', select: 'fullName email' })
        .sort({ createdAt: -1 })
        .exec();

    return supports
}

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
    if (!isAdmin || ( isAdmin.role !== USER_ROLES.ADMIN && isAdmin.role !== USER_ROLES.SUPER_ADMIN)) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Admin not found");
    };

    const supportUpdated = await Support.findByIdAndUpdate(supportID,{adminReply: reply, status: "SOLVED"},{ new: true });
    if (!supportUpdated) {
        throw new ApiError(StatusCodes.NOT_FOUND,"Not founded the support, something was wrong")
    };
    
    return supportUpdated
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
    updateSubCatagory
}