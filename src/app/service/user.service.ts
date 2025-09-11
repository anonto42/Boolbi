import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError";
import User from "../../model/user.model";
import { FilterPost, GetRecommendedPostsOptions, ISignUpData, JobPost, NotificationQuery, PaginationParams, SearchData, TOffer, TRating } from "../../types/user"
import { bcryptjs } from "../../helpers/bcryptHelper";
import { IUser } from "../../Interfaces/User.interface";
import { JwtPayload } from "jsonwebtoken";
import { IPhotos } from "../../Interfaces/post.interface";
import unlinkFile from "../../shared/unlinkFile";
import Post from "../../model/post.model";
import mongoose, { Types } from "mongoose";
import { ACCOUNT_STATUS, ACCOUTN_ACTVITY_STATUS, USER_ROLES } from "../../enums/user.enums";
import Offer from "../../model/offer.model";
import Order from "../../model/order.model";
import Support from "../../model/support.model";
import { messageSend } from "../../helpers/firebaseHelper";
import Notification from "../../model/notification.model";
import generateOTP from "../../util/generateOTP";
import { emailTemplate } from "../../shared/emailTemplate";
import { emailHelper } from "../../helpers/emailHelper";
import { OFFER_STATUS } from "../../enums/offer.enum";
import { Request, Response } from "express";
import { RatingModel } from "../../model/Rating.model";
import Chat from "../../model/chat.model";
import { IOffer } from "../../Interfaces/offer.interface";

//User signUp
const signUp = async ( 
    payload : ISignUpData
) => {
    const { fullName, email, password, confirmPassword, phone, role } = payload;

    const isExist = await User.findOne({email: email});
    if (isExist) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Email is alredy exist!"
      );
    };

    if (password !== confirmPassword) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Your password & confirmPassword must same!"
      );
    };

    if(role !== "SERVICE_PROVIDER" && role !== "USER"){
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        `Your can't create your account with ( ${role} ) this role!`
      );
    };

    const hashed = await bcryptjs.Hash( password );

    const userData = {
        fullName,
        email,
        password: hashed,
        phone,
        role,
    };

    const user: IUser = await User.create(userData);
    if (!user) {
      throw new ApiError(
        StatusCodes.FAILED_DEPENDENCY,
        "We couldn't create your account due to an unexpected issue. Please try again later."
      )
    };
    
    // generate otp
    const otp = generateOTP();

    //Send Mail
    const mail = emailTemplate.sendMail({otp, email,name: user.fullName, subjet: "Get OTP"});
    emailHelper.sendEmail(mail);

    await User.updateOne(
        { email },
        {
          $set: {
            'otpVerification.otp': otp,
            'otpVerification.time': new Date(Date.now() + 3 * 60000)
          },
        }
    );

    return "Now you must verify your account!";
}

//All Profile Information
const profle = async ( 
    payload : JwtPayload
) => {
    const { userID } = payload;
    const objID = new mongoose.Types.ObjectId(userID);

    const isExist = await User.findById(objID).select("-password -otpVerification -isSocialAccount -latLng -__v -searchedCatagory");
    // .lean().exec();
    if (!isExist) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"User not exist!")
    };

    if ( isExist.accountStatus === ACCOUNT_STATUS.DELETE || isExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
      throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isExist.accountStatus.toLowerCase()}!`)
    };

    return { user: isExist }
}

//Update profile data
const UP = async (
  payload: JwtPayload,
  data: IUser
) => {
  const { userID } = payload;

  const isExist = await User.findOne({ _id: userID });
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "User not exist!");
  }

  if (
    isExist.accountStatus === ACCOUNT_STATUS.DELETE ||
    isExist.accountStatus === ACCOUNT_STATUS.BLOCK
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      `Your account was ${isExist.accountStatus.toLowerCase()}!`
    );
  }

  const fieldsToUpdate = [
    "fullName",
    "email",
    "phone",
    "city",
    "address",
    "postalCode",
    "language",
    "category",
    "subCategory",
    "samplePictures",
    "description",
    "latLng"
  ];

  const dataForUpdate: Partial<IUser> = {};

  for (const field of fieldsToUpdate) {
    const newValue = data[field as keyof IUser];
    const oldValue = isExist[field as keyof IUser];

    if (typeof newValue !== "undefined") {
      // Handle samplePictures
      if (field === "samplePictures" && Array.isArray(oldValue) && Array.isArray(newValue)) {
        const removedImages = oldValue.filter(img => !newValue.includes(img));
        for (const img of removedImages) {
          unlinkFile(img);
        }
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          dataForUpdate[field] = newValue;
        }
        continue;
      }

      // Handle latLng (GeoJSON Point)
      if (field === "latLng") {
        const lat = (newValue as any).lat;
        const lng = (newValue as any).lng ?? (newValue as any).lan;

        if (
          typeof lat === "number" &&
          typeof lng === "number" &&
          (
            !oldValue ||
            JSON.stringify((oldValue as any).coordinates) !== JSON.stringify([lng, lat])
          )
        ) {
          dataForUpdate.latLng = {
            type: "Point",
            coordinates: [lng, lat],
          };
        }
        continue;
      }

      // All other fields
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        dataForUpdate[field as keyof IUser] = newValue;
      }
    }
  }

  if (Object.keys(dataForUpdate).length === 0) {
    return isExist; // No changes
  }

  const updatedUser = await User.findByIdAndUpdate(
    isExist._id,
    { $set: dataForUpdate },
    { new: true }
  ).select("-password -otpVerification -isSocialAccount");

  return updatedUser;
};

//Delete Profile
const profileDelete = async (
  payload: JwtPayload
) => {
  const { userID } = payload;
  const isUser = await User.findById(userID);

  if (!isUser) {
    throw new ApiError(StatusCodes.BAD_GATEWAY, "Your account does not exist!");
  }

  if (
    isUser.accountStatus === ACCOUNT_STATUS.DELETE ||
    isUser.accountStatus === ACCOUNT_STATUS.BLOCK
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      `Your account was ${isUser.accountStatus.toLowerCase()}!`
    );
  }

  if (Array.isArray(isUser.samplePictures)) {
    for (const img of isUser.samplePictures) {
      unlinkFile(img);
    }
  }

  if (isUser.profileImage) {
    unlinkFile(isUser.profileImage);
  }

  isUser.accountStatus = ACCOUNT_STATUS.DELETE;
  await isUser.save();

  return true;
};

//Profile images update
const Images = async ( 
    payload : JwtPayload,
    data : IPhotos,
    images: string[] | string
) => {
    const { userID } = payload;
    const { fildName } = data;
    if (!fildName) throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You must give the the name of your fild to add the images"
    );

    const isExist = await User.findOne({_id: userID});
    if (!isExist) {
        throw new ApiError(
          StatusCodes.NOT_ACCEPTABLE,
          "User not exist!"
        )
    };
    
    if ( 
      isExist.accountStatus === ACCOUNT_STATUS.DELETE || 
      isExist.accountStatus === ACCOUNT_STATUS.BLOCK 
    ) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          `Your account was ${isExist.accountStatus.toLowerCase()}!`
        )
    };

    if (fildName === "samplePictures" && images.length < 1) {

        if ( images.length < 2 ) unlinkFile(images[0])
        else (images as string[]).map( (e: any) => unlinkFile(e))

        throw new ApiError(StatusCodes.BAD_GATEWAY,"You are not able to do that!")
    };

    if (fildName === "profileImage") {
        const user = await User.findByIdAndUpdate(
          isExist._id,
          { 
            profileImage: images[0] 
          }
        )
        unlinkFile(user.profileImage)
        return images[0]
    };

    if ( fildName === "samplePictures") {
        const user = await User.findByIdAndUpdate(
          isExist._id,
          { 
            samplePictures: images 
          }
        );
        user.samplePictures.map( (e: any) => unlinkFile(e))
        return images
    };

    if ( fildName !== "samplePictures" && fildName !== "profileImage" ) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "You give a wrong inpout on the fildName you must give profileImage or samplePictures"
        )
    };
}

//Change the langouage of the user
const language = async (
    {
        payload,
        language,
    }: {
        payload: JwtPayload,
        language: string,
    }
) => {
    const isUserExist = await User.findById(payload.userID);
    if (!isUserExist) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"User not exist!")
    };
    
    if ( isUserExist.accountStatus === ACCOUNT_STATUS.DELETE || isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUserExist.accountStatus.toLowerCase()}!`)
    };

    isUserExist.language = language
    await isUserExist.save()

    return { language }
}

//Change the langouage of the user
const accountStatus = async (
    payload: JwtPayload
) => {
    const isUserExist = await User.findById(payload.userID);
    if (!isUserExist) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"User not exist!")
    };
    
    if ( isUserExist.accountStatus === ACCOUNT_STATUS.DELETE || isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
      throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUserExist.accountStatus.toLowerCase()}!`)
    };

    let user;

    if ( isUserExist.accountActivityStatus === ACCOUTN_ACTVITY_STATUS.ACTIVE ) {
      user = await User.findByIdAndUpdate(isUserExist._id,{accountActivityStatus: "INACTIVE" },{ new: true}).select("accountActivityStatus")
    };

    if ( isUserExist.accountActivityStatus === ACCOUTN_ACTVITY_STATUS.INACTIVE ) {
      user = await User.findByIdAndUpdate(isUserExist._id,{accountActivityStatus: "ACTIVE" },{ new: true }).select("accountActivityStatus")
    };

    return user;
}

//Privacy & Policy
const privacy = async ( 
    payload : JwtPayload
) => {
    const { userID } = payload;

    const isExist = await User.findOne({_id: userID})
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"User not exist!")
    };

    if ( isExist.accountStatus === ACCOUNT_STATUS.DELETE || isExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isExist.accountStatus.toLowerCase()}!`)
    };

    const privacy = await User.findOne({ role: USER_ROLES.SUPER_ADMIN });
    if (!privacy) {
        return ""
    }

    return privacy.privacyPolicy;
}

//Terms & Conditions
const conditions = async ( 
    payload : JwtPayload
) => {
    const { userID } = payload;

    const isExist = await User.findOne({_id: userID})
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"User not exist!")
    };

    if ( isExist.accountStatus === ACCOUNT_STATUS.DELETE || isExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isExist.accountStatus.toLowerCase()}!`)
    };

    const condition = await User.findOne({ role: USER_ROLES.SUPER_ADMIN });
    if (!condition) {
        return ""
    }

    return condition.termsConditions;
}

//Create post
const createPost = async (
  payload: JwtPayload,
  data: JobPost,
  images: string[],
  coverImage: string
) => {
  try {
    const { userID } = payload;
    const {
      category,
      subCategory,
      deadline,
      description,
      location,
      projectName,
      lng,
      lat,
    } = data;
  
    const isUserExist = await User.findOne({ _id: userID });
    if (!isUserExist) {
      for (const img of images) {
        unlinkFile(img);
      }
      unlinkFile(coverImage);
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }
  
    if (
      isUserExist.accountStatus === ACCOUNT_STATUS.DELETE ||
      isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK
    ) {
      for (const img of images) {
        unlinkFile(img);
      }
      unlinkFile(coverImage);
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        `Your account was ${isUserExist.accountStatus.toLowerCase()}!`
      );
    }
  
    const isJobExistWithTitle = await Post.findOne({ projectName });
    if (isJobExistWithTitle) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        `A job already exists with the title ${projectName}`
      );
    }
  
    if (images?.length < 1) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "You must provide at least one image to publish the job post"
      );
    }
  
    const jobData = {
      projectName,
      category,
      subCategory,
      location,
      deadline,
      coverImage,
      jobDescription: description,
      showcaseImages: images,
      creatorID: isUserExist._id,
      latLng: {
        type: "Point",
        coordinates: [Number(lng), Number(lat)],
      },
    };
  
    const post = await Post.create(jobData);
    if (!post) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "Something went wrong while creating the job post. Please try again."
      );
    }
  
    isUserExist.job.push(post._id as Types.ObjectId);
    await isUserExist.save();
  
    return post;
  } catch (error: any) {
    for (const img of images) {
      unlinkFile(img);
    }
    unlinkFile(coverImage);
    throw new ApiError(
      StatusCodes.FAILED_DEPENDENCY,
      error.message
    )
  }
};

//Wone Created posts 
const post = async (
    payload: JwtPayload,
    page = 1,
    limit = 10
) => {
    const { userID } = payload;
    const isUserExist = await User.findById(userID);
    if (!isUserExist) {
        throw new ApiError(StatusCodes.NOT_FOUND,"User not founded");
    };
    
    if ( isUserExist.accountStatus === ACCOUNT_STATUS.DELETE || isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUserExist.accountStatus.toLowerCase()}!`)
    };

    const skip = (page - 1) * limit;

    const posts = await Post.find({ creatorID: isUserExist._id })
                            // .populate("offers", '-__v')
                            .select("-__v")
                            .skip(skip)
                            .limit(limit)
                            .sort({ createdAt: -1 })
                            .lean();

    posts.forEach((element:any) => {
      element.totalOffers = element.offers.length;
      delete element.offers
    });

    return posts
};

// Update a post
const UPost = async (
  payload: JwtPayload,
  body: {
    postID: string;
    [key: string]: any;
  }
) => {
 try {
   const { userID } = payload;
    if (!body.latLng) {
      body.latLng = {
        type: "Point",
        coordinates: []
      };
    }
   body.latLng.coordinates = [Number(body.lng), Number(body.lat)];
   const { postID, ...updateFields } = body;
 
   const isUserExist = await User.findById(userID);
   if (!isUserExist) {
     throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
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
 
   const post = await Post.findById(postID);
   if (!post) {
     throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
   }
 
   if (post.creatorID.toString() !== userID.toString()) {
     throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not the owner of this post");
   }
 
   let isChanged = false;
 
   if (updateFields.coverImage && updateFields.coverImage !== post.coverImage) {
     if (post.coverImage) unlinkFile(post.coverImage);
     post.coverImage = updateFields.coverImage;
     isChanged = true;
   }
 
   for (const key in updateFields) {
     if (
       Object.prototype.hasOwnProperty.call(updateFields, key) &&
       updateFields[key] !== undefined &&
       key !== "coverImage"
     ) {
       if (key === 'showcaseImages') {
         const oldImages = post.showcaseImages || [];
         const newImages = updateFields.showcaseImages;
 
         if (Array.isArray(newImages)) {
           const removedImages = oldImages.filter((img: any) => !newImages.includes(img));
 
           for (const img of removedImages) {
             unlinkFile(img);
           }
 
           const hasChanged =
             oldImages.length !== newImages.length ||
             oldImages.some((img: any, i: number) => img !== newImages[i]);
 
           if (hasChanged) {
             post.showcaseImages = newImages;
             isChanged = true;
           }
         }
       } else if (post[key] !== updateFields[key]) {
         post[key] = updateFields[key];
         isChanged = true;
       }
     }
   }
 
   if (isChanged) {
     await post.save();
   }
 
   return {
     updated: isChanged,
     post,
   };
 } catch (error: any) {
  if (body.image) {
    for (const img of body.image) {
      unlinkFile(img);
    }
    unlinkFile(body.coverImage);
  }
  throw new ApiError(
    StatusCodes.NOT_ACCEPTABLE,
    error.message
  )
 }
};

//Delete Wone Created job
const deleteJob = async (
  payload: JwtPayload,
  Data: { postID: string }
) => {
  const { userID } = payload;
  const { postID } = Data;

  if (!postID) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "You must provide the post ID to remove");
  }

  const isUserExist = await User.findById(userID);
  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  if (
    isUserExist.accountStatus === ACCOUNT_STATUS.DELETE ||
    isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      `Your account is ${isUserExist.accountStatus.toLowerCase()}!`
    );
  }

  const hasJob = isUserExist.job.includes(postID);
  if (!hasJob) {
    throw new ApiError(StatusCodes.NOT_FOUND, "This post is not linked to your account");
  }

  const post = await Post.findById(postID);
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
  }

  if (post.coverImage) {
    unlinkFile(post.coverImage);
  }

  if (post.showcaseImages && Array.isArray(post.showcaseImages)) {
    post.showcaseImages.forEach((img: string) => unlinkFile(img));
  }

  isUserExist.job = isUserExist.job.filter((e: any) => e.toString() !== postID);
  await isUserExist.save();

  await Post.findByIdAndDelete(postID);

  return true;
};

//A job
const singlePost = async (
    payload: JwtPayload,
    Data: { postID: string }
  ) => {
    const { userID } = payload;
    const { postID } = Data;
  
    if (!postID) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "You must provide the post ID to remove");
    };
  
    const isUserExist = await User.findById(userID);
    if (!isUserExist) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    };
  
    if (
      isUserExist.accountStatus === ACCOUNT_STATUS.DELETE ||
      isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK
    ) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        `Your account is ${isUserExist.accountStatus.toLowerCase()}!`
      );
    }
  
    const post = await Post.findById(Data.postID)
                            .populate({
                                path: 'offers',
                                select: 'myBudget description image',
                                populate: {
                                    path: 'by',
                                    select: '-password -otpVerification -isSocialAccount -latLng -job -favouriteServices -iOffered -myOffer -orders -searchedCatagory -__v'
                                }
                            })

    const postData: any = post;
    let isSaved = false;
    isUserExist.favouriteServices.forEach(( e: any ) => {
      if (e.toString() === postID.toString()) isSaved = true;
    });
    postData.isFavourite = isSaved;
  
    return postData;
};
  
//Add to the favorite list 
const favorite = async (
    payload: JwtPayload,
    data: { id: string }
) => {
    const { userID } = payload;
    const { id } = data;

    const isUserExist = await User.findById(userID);
    if (!isUserExist) {
      throw new ApiError(StatusCodes.NOT_FOUND,"User not founded");
    };
    
    if ( isUserExist.accountStatus === ACCOUNT_STATUS.DELETE || isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
      throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUserExist.accountStatus.toLowerCase()}!`)
    };

    if (!id) {
      throw new ApiError(StatusCodes.BAD_REQUEST,"You must give the service _id")
    };

    // if (isUserExist.favouriteServices.some((e: any) => e.toString() === id)) {
    //   throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "You have already added this service to your favorite list");
    // }

    if ( isUserExist.role == USER_ROLES.SERVICE_PROVIDER) {

      if (isUserExist.favouriteServices.some((e: any) => e._id.toString() === id)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "You have already added this service to your favorite list");
      }
      isUserExist.favouriteServices.push(id);
    } else if (isUserExist.role == USER_ROLES.USER) {

      if (isUserExist.favouriteProvider.some((e: any) => e.toString() === id)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "You have already added this to your favorite list");
      }

      isUserExist.favouriteProvider.push(id);
    }

    await isUserExist.save()

    return true;
}

//favorites list 
const getFavorite = async (
  payload: JwtPayload,
  page = 1,
  limit = 10
) => {
  const { userID } = payload;
  const isUserExist = await User.findById(userID);

  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
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

  let userWithFavorites : IUser | null = null;

  const skip = (page - 1) * limit;

  if (isUserExist.role === USER_ROLES.SERVICE_PROVIDER) {
    console.log("Hit on the SERVICE_PROVIDER")
    userWithFavorites = await User.findById(userID)
      .populate({
        path: "favouriteServices",
        options: {
          skip,
          limit,
        }
      })
      .select("-latLng")
      .lean();
  } else if (isUserExist.role === USER_ROLES.USER) {
    console.log("Hit on the User")
    userWithFavorites = await User.findById(userID)
    .populate({
        path: "favouriteProvider",
        select: "-creatorID -jobDescription -showcaseImages -latLng -offers -__v -favouriteProvider -otpVerification -latLng -iOffered -myOffer -orders -searchedCatagory -password -accountBalance -isSocialAccount -createdAt -updatedAt -deviceID -favouriteServices -job -role",
        options: {
          skip,
          limit,
        }
      })
      .select("-latLng")
      .lean();
  }


  return {
    favorites: isUserExist.role === USER_ROLES.SERVICE_PROVIDER ? userWithFavorites?.favouriteServices : userWithFavorites?.favouriteProvider,
  };
};

//remove favorite 
const removeFavorite = async (
    payload: JwtPayload,
    Data: { id: string }
) => {
    const { userID } = payload;
    const { id } = Data;
    const isUserExist = await User.findById(userID);
    if (!isUserExist) {
        throw new ApiError(StatusCodes.NOT_FOUND,"User not founded");
    };
    
    if ( isUserExist.accountStatus === ACCOUNT_STATUS.DELETE || isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
      throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUserExist.accountStatus.toLowerCase()}!`)
    };

    if (isUserExist.role === USER_ROLES.SERVICE_PROVIDER) {
      const hasJob = isUserExist.favouriteServices.some((e: any) => e.toString() === id);
      if (!hasJob) {
        throw new ApiError(StatusCodes.NOT_FOUND, "This post is not linked to your favorite");
      }
      isUserExist.favouriteServices = isUserExist.favouriteServices.filter((e: any) => e.toString() !== id);
    } else if (isUserExist.role === USER_ROLES.USER) {
      const hasProvider = isUserExist.favouriteProvider.some((e: any) => e.toString() === id);
      if (!hasProvider) {
        throw new ApiError(StatusCodes.NOT_FOUND, "This provider is not linked to your favorite");
      }
      isUserExist.favouriteProvider = isUserExist.favouriteProvider.filter((e: any) => e.toString() !== id);
    }

    await isUserExist.save();

    return true;
}

//My offers
const offers = async (
  payload: JwtPayload,
  page = 1,
  limit = 10
) => {
  const { userID } = payload;
  const skip = (page - 1) * limit;

  const isUserExist = await User.findById(userID)
    .populate({
      path: "myOffer",
      options: { skip, limit },
      populate: [
        {
          path: "projectID",
          select: "coverImage showcaseImages projectName"
        }
      ]
    });

  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
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

  const allOffers = await Offer
    .find({
      to: isUserExist._id
    })
    .sort({ updatedAt: -1})
    .populate("projectID", "coverImage showcaseImages projectName")
    .populate("form", "fullName profileImage")
    .lean();

  const ratings = await Promise.all(
    allOffers.map(async (e: any) => {
      const ratings = await RatingModel.find({ provider: e.form._id });

      // Calculate average
      let average = 0;
      if (ratings.length > 0) {
        const total = ratings.reduce((sum, r) => sum + r.rating, 0);
        average = total / ratings.length;
      }

      return {
        _id: e._id,
        project: e.projectID,
        offerBy: {
          id: e.form._id,
          name: e.form.fullName,
          image: e.form.profileImage,
          averageRating: average,
          totalRatings: ratings.length
        },
        budget: e.budget,
        location: e.jobLocation,
        description: e.description,
      };
    })
  );

  return ratings || []
  
};

//I Offered
const iOfferd = async (
  payload: JwtPayload,
  page = 1,
  limit = 10
) => {
  const { userID } = payload;

  const skip = (page - 1) * limit;

  const isUserExist = await User.findById(userID)
    .populate({
      path: "iOffered",
      options: { skip, limit },
      populate: [
        // { path: "to", select: "-password -otpVerification -isSocialAccount -latLng -job -favouriteServices -iOffered -myOffer -orders -searchedCatagory -__v" },
        // { path: "form", select: "-password -otpVerification -isSocialAccount -latLng -job -favouriteServices -iOffered -myOffer -orders -searchedCatagory -__v" }
      ]
    });

  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
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

  const total = isUserExist.iOffered?.length || 0;

  return {
    data: isUserExist.iOffered || [],
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
};

//get a Offer
const getAOffer = async (
  payload: JwtPayload,
  offerId: string
) => {
  const { userID } = payload;

  const isUserExist = await User.findById(userID);

  const iOffer = isUserExist.iOffered.filter( (e:any) => e._id.toString() === offerId );
  const myOffers = isUserExist.myOffer.filter( (e:any) => e._id.toString() === offerId );

  if (!iOffer && !myOffers ) {
    throw new ApiError(
      StatusCodes.NOT_ACCEPTABLE,
      "You are not eligible to get this offer!"
    );
  };

  const offer = await Offer
    .findById(offerId)
    .populate("to","fullName profileImage")
    .populate("form","fullName email")
    .lean() as IOffer;
  if (!offer) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "This offer was not exist!"
    );
  };


  if (!isUserExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  };

  if (
    isUserExist.accountStatus === ACCOUNT_STATUS.DELETE ||
    isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      `Your account was ${isUserExist.accountStatus.toLowerCase()}!`
    );
  };

  const chatFrom = 
    payload.userID.toString() === offer.to._id.toString()?
    offer.form._id.toString() 
    : offer.to._id.toString();

  let isFavorite: boolean = false;

    if ( isUserExist.role == USER_ROLES.SERVICE_PROVIDER) {

      if (isUserExist.favouriteServices.some((e: any) => e._id.toString() === offer.projectID.toString())) {
        isFavorite = true;
      }

    } else if (isUserExist.role == USER_ROLES.USER) {

      if (isUserExist.favouriteProvider.some((e: any) => e.toString() === offer.form._id.toString())) {
        isFavorite = true;
      }

    }

  const chat = await Chat.findOne({
    users:[
      new mongoose.Types.ObjectId(payload.userID),
      new mongoose.Types.ObjectId(chatFrom)
    ]
  });

  return {
    ...offer,
    isFavorite,
    chatID: chat?._id ? chat._id : ""
  };
};

// Create offer
const cOffer = async (
    payload: JwtPayload,
    data: TOffer,
    images: string[]
) => {
    try {
      const { userID } = payload;
      const {
        projectName,
        myBudget,
        category,
        location,
        deadline,
        validFor,
        description,
        to,
        endDate,
        startDate
      } = data;
      const isUserExist = await User.findById(userID);

      if (!isUserExist) {
        throw new ApiError(
          StatusCodes.NOT_FOUND, 
          "User not found"
        );
      };

      const ifCustomerExist = await User.findById(to);
      if (!ifCustomerExist) {
        throw new ApiError(
          StatusCodes.NOT_FOUND, 
          "User not found"
        );
      };

      if (
        isUserExist.accountStatus === ACCOUNT_STATUS.DELETE ||
        isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK
      ) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          `Your account was ${isUserExist.accountStatus.toLowerCase()}!`
        );
      };
      if (
        ifCustomerExist.accountStatus === ifCustomerExist.DELETE ||
        ifCustomerExist.accountStatus === ifCustomerExist.BLOCK
      ) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          `Your account was ${isUserExist.accountStatus.toLowerCase()}!`
        );
      };
  
      const offerData = {
        to: ifCustomerExist._id,
        form: isUserExist._id,
        projectName,
        category,
        budget: Number(myBudget),
        jobLocation: location,
        deadline,
        description,
        startDate,
        endDate,
        validFor:validFor,
        companyImages: images,
      }
  
      const offer = await Offer.create(offerData);

      console.log(offer)
  
      isUserExist.iOffered.push(offer._id);
      ifCustomerExist.myOffer.push(offer._id);
      await ifCustomerExist.save();
      await isUserExist.save();
  
      const notification = await Notification.create({
        for:ifCustomerExist._id,
        content: `You get a offer from ${isUserExist.fullName}`
      })
  
      //@ts-ignore
      const io = global.io;
      io.emit(`socket:${to}`,notification)

      try {
        if (ifCustomerExist.deviceID) {
          await messageSend({
            notification: {
              title: `${isUserExist.fullName} send you a offer!`,
              body: `${description}`
            },
            token: ifCustomerExist.deviceID
          });
        }
      } catch (error) {
        console.log(error)
      }

     
      return offer;
    } catch (error: any) {
      for (const img of images) {
        unlinkFile(img);
      }
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      )
    }
};

// offer intraction
const intracatOffer = async(
    payload: JwtPayload,
    data: { 
      acction: "DECLINE" | "APPROVE",
      offerId: string
    }
)=>{
    const { userID } = payload;
    const { acction, offerId } = data;
    const isUserExist = await User.findById(userID);
    const isOfferExist = await Offer.findById(offerId);
    
    if (!isOfferExist) {
      throw new ApiError(StatusCodes.NOT_FOUND,"Offer not founded");
    };

    if ( isOfferExist.status === "APPROVE" ) {
      throw new ApiError(StatusCodes.NOT_FOUND,"Offer already accepted!");
    };

    const user1 = await User.findById(isOfferExist.to);
    const user2 = await User.findById(isOfferExist.form);
    if (!user1 || !user2) {
      throw new ApiError(StatusCodes.NOT_FOUND,"User not founded");
    };
    
    if ( isUserExist.accountStatus === ACCOUNT_STATUS.DELETE || isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
      throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUserExist.accountStatus.toLowerCase()}!`)
    };

    let customer;
    let provider;

    if (user1.role === USER_ROLES.USER) {
      customer = user1;
      provider = user2;
    } else if ( user2.role === USER_ROLES.USER ) {
      customer = user2;
      provider = user1;
    }
    
    if ( acction === "DECLINE" ) {
      isOfferExist.status = "DECLINE";
      const newArr = user1.myOffer.filter( (e: any) => e !== data.offerId );
      user1.myOffer = newArr;

      const notification = await Notification.create({
        for: isUserExist._id != customer._id ? provider._id : customer._id,
        content: isUserExist._id != customer._id ? `${customer.fullName} was decline your offer` : `${provider.fullName} was decline your offer!`
      });

      console.log(notification)

      //@ts-ignore
      const io = global.io;
      io.emit(`socket:${notification.for.toString()}`, notification)
       
      await user1.save();
      await isOfferExist.save();
      return "Offer Decline"
    };

    const notification = await Notification.create({
      for: isUserExist._id != customer._id ? provider._id : customer._id,
      content: isUserExist._id != customer._id ? `${customer.fullName} was accept your offer` : `${provider.fullName} was accept your offer now you should pay to confirm your order!`
    });


    //@ts-ignore
    const io = global.io;
    io.emit(`socket:${notification.for.toString()}`, notification)

    isOfferExist.status = OFFER_STATUS.APPROVE;
    await isOfferExist.save();

    try {
      const pushNotificationFor = await User.findById(notification.for)!
      if (pushNotificationFor.deviceID) {
        await messageSend({
          notification: {
            title: notification.content,
            body: `${isOfferExist.description}`
          },
          token: pushNotificationFor.deviceID
        });
      }
      
    } catch (error) {
      console.log(error)
    }

    return "Offer accepted";

};

// delete offer
const deleteOffer = async(
    payload: JwtPayload,
    offerID: string
)=>{
    const { userID } = payload;
    const isUserExist = await User.findById(userID);
    if (!isUserExist) {
      throw new ApiError(StatusCodes.NOT_FOUND,"User not founded");
    };
    if ( isUserExist.accountStatus === ACCOUNT_STATUS.DELETE || isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
      throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUserExist.accountStatus.toLowerCase()}!`)
    };

    const iOffer = isUserExist.iOffered.filter( (e:any) => e._id.toString() === offerID );
    const myOffers = isUserExist.myOffer.filter( (e:any) => e._id.toString() === offerID );

    if (!iOffer && !myOffers ) {
      throw new ApiError(
        StatusCodes.NOT_ACCEPTABLE,
        "You are not eligible to get this offer!"
      );
    };

    const offer = await Offer.findByIdAndDelete(offerID);
    
    if (!offer) {
      throw new ApiError(StatusCodes.NOT_FOUND,"Offer not founded");
    };

    return offer;
};

// suport request
const supportRequest = async(
  payload: JwtPayload,
  {
    message,
    category,
    image
  }:{
    message: string,
    category: string,
    image: string
  }
)=>{
  const { userID } = payload;
  if ( !message || !category ) {
    throw new ApiError(
      StatusCodes.NOT_ACCEPTABLE,
      "You must give the required fields"
    )
  };
  const isUserExist = await User.findById(userID);
  if (!isUserExist) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "User not founded"
    );
  };
  if ( 
    isUserExist.accountStatus === ACCOUNT_STATUS.DELETE || 
    isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK 
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      `Your account was ${isUserExist.accountStatus.toLowerCase()}!`
    )
  };

  const admins = await User.find({
    role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] }
  });

  const support = await Support.create({
    for: isUserExist._id,
    category: category,
    message,
    isImage: image? true : false,
    image: image? image : ""
  });

  if (!support) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR, 
      "Support not created"
    );
  };

  admins.map( async ( e: any ) => {
    const notification = await Notification.create({
      for:e._id,
      content: `You get a support request from ${isUserExist.fullName}`
    })
  
      //@ts-ignore
    const io = global.io;
    io.emit(`socket:${e._id}`,notification)
  })

  return support;
};

const getRequests = async (
  payload: JwtPayload,
  params: PaginationParams
) => {
  const { userID } = payload;
  const { page = 1, limit = 20 } = params;

  const skip = (page - 1) * limit;

  const [requests, total] = await Promise.all([
    Support.find({ for: userID, category: params.category })
      .sort({ createdAt: -1 })
      .select("message isAdmin updatedAt image")
      .skip(skip)
      .limit(limit),
    Support.countDocuments({ for: userID })
  ]);

  return {
    data: requests,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit)
  };
};

export const searchPosts = async (
  payload: JwtPayload,
  data: SearchData
): Promise<any> => {
  const { userID } = payload;
  const { searchQuery = "", page = 1, limit = 20 } = data;

  if (!searchQuery.trim()) {
    throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Search query is required.");
  }

  const user = await User.findById(userID);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  if ([ACCOUNT_STATUS.BLOCK, ACCOUNT_STATUS.DELETE].includes(user.accountStatus)) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      `Your account was ${user.accountStatus.toLowerCase()}!`
    );
  }

  const searchType = user.role === USER_ROLES.SERVICE_PROVIDER ? "POST" : "PROVIDER";

  const updatedKeywords = [
    searchQuery,
    ...user.searchedCatagory.filter(
      (term: string) => term.toLowerCase() !== searchQuery.toLowerCase()
    ),
  ].slice(0, 5);
  user.searchedCatagory = updatedKeywords;
  await user.save();

  const skip = (page - 1) * limit;

  if (searchType === "POST") {
    return await searchPostsByQuery(searchQuery, skip, limit, page);
  } else {
    return await searchProvidersByQuery(searchQuery, skip, limit, page);
  }
};

const searchPostsByQuery = async (
  query: string,
  skip: number,
  limit: number,
  page: number
): Promise<any> => {
  const conditions = {
    $or: [
      { projectName: { $regex: query, $options: "i" } },
      { category: { $regex: query, $options: "i" } },
      { subCategory: { $regex: query, $options: "i" } },
      { companyName: { $regex: query, $options: "i" } },
      { jobDescription: { $regex: query, $options: "i" } },
    ],
  };

  const [results, total] = await Promise.all([
    Post.find(conditions)
      .sort({ createdAt: -1 })
      .populate({
        path: "creatorID",
        select: "name",
      })
      .skip(skip)
      .limit(limit)
      .lean(),
    Post.countDocuments(conditions),
  ]);

  return {
    data: results,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  };
};

const searchProvidersByQuery = async (
  query: string,
  skip: number,
  limit: number,
  page: number
): Promise<any> => {

  const conditions = {
    role: USER_ROLES.SERVICE_PROVIDER,
    $or: [
      { fullName: { $regex: query, $options: "i" } },
      { category: { $regex: query, $options: "i" } },
      { subCategory: { $regex: query, $options: "i" } },
      { serviceDescription: { $regex: query, $options: "i" } },
    ],
  };

  const [results, total] = await Promise.all([
    User.find(conditions)
      .select(
        "-password -latLng -favouriteServices -iOffered -myOffer -orders -searchedCatagory -accountStatus -isSocialAccount -otpVerification"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(conditions),
  ]);

  return {
    data: results,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  };
};

const getRecommendedPosts = async ({
  payload,
  page = 1,
  limit = 20,
  query = "",
}: GetRecommendedPostsOptions) => {
  const { userID } = payload;
  const skip = (page - 1) * limit;

  const user = (await User.findById(userID).lean()) as IUser;
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

  if (
    user.accountStatus === ACCOUNT_STATUS.DELETE ||
    user.accountStatus === ACCOUNT_STATUS.BLOCK
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      `Your account was ${user.accountStatus.toLowerCase()}!`
    );
  }

  const postType =
    user.role === USER_ROLES.SERVICE_PROVIDER ? "POST" : "PROVIDER";

  const shuffleArray = (arr: any[]) => arr.sort(() => Math.random() - 0.5);

  // ----------------------------------------
  // Escape regex to avoid special char issues
  // ----------------------------------------
  const escapeRegex = (str: string) =>
    str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // ----------------------------------------
  // If query is empty → return random
  // ----------------------------------------
  if (!query.trim()) {
    if (postType === "POST") {
      const allPosts = await Post.find()
        .populate("offers")
        .select("-latLng")
        .lean();

      return shuffleArray(allPosts).slice(skip, skip + limit);
    } else {
      const allProviders = await User.find({
        role: USER_ROLES.SERVICE_PROVIDER,
        accountStatus: ACCOUNT_STATUS.ACTIVE,
      })
        .select(
          "-password -latLng -isSocialAccount -otpVerification -__v -searchedCatagory -orders -myOffer -iOffered -favouriteServices -job -accountBalance -accountStatus"
        )
        .lean();

      return shuffleArray(allProviders).slice(skip, skip + limit);
    }
  }

  // ----------------------------------------
  // Case-insensitive search conditions
  // ----------------------------------------
  const searchKeywords = query.trim().split(/\s+/);

  const andConditions: any[] = searchKeywords.map((kw) => {
    const regex = { $regex: escapeRegex(kw), $options: "i" }; // "i" → ignore case

    if (postType === "POST") {
      return {
        $or: [
          { projectName: regex },
          { catagory: regex },
          { subCategory: regex },
          { jobDescription: regex },
        ],
      };
    } else {
      return {
        $or: [
          { fullName: regex },
          { category: regex },
          { subCategory: regex },
          { description: regex },
        ],
      };
    }
  });

  // ----------------------------------------
  // Main Search Query
  // ----------------------------------------
  if (postType === "POST") {
    const posts = await Post.find({ $and: andConditions })
      .populate({
        path: "offers",
        populate: {
          path: "form",
          select: "fullName email phone address profileImage",
        },
      })
      .sort({ createdAt: -1 })
      .select("-latLng")
      .skip(skip)
      .limit(limit)
      .lean();

    return posts; // if empty → just []
  }

  // ----------------------------------------
  // Provider Search
  // ----------------------------------------
  const providers = await User.find({
    $and: andConditions,
    role: USER_ROLES.SERVICE_PROVIDER,
    accountStatus: ACCOUNT_STATUS.ACTIVE,
  })
    .select(
      "-otpVerification -isSocialAccount -latLng -job -favouriteServices -iOffered -myOffer -orders -searchedCatagory -password -__v"
    )
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return providers; // if empty → just []
};

const getPostsOrProviders = async ({
  payload,
  page = 1,
  limit = 20,
  query = "",
  category,
  subCategory,
  lat,
  lng,
  distance = 50,
}: GetRecommendedPostsOptions & FilterPost) => {
  const { userID } = payload;
  const skip = (page - 1) * limit;

  // Fetch user
  const user = await User.findById(userID).lean() as IUser;
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

  if (
    user.accountStatus === ACCOUNT_STATUS.DELETE ||
    user.accountStatus === ACCOUNT_STATUS.BLOCK
  ) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      `Your account was ${user.accountStatus.toLowerCase()}!`
    );
  }

  const isServiceProvider = user.role === USER_ROLES.SERVICE_PROVIDER;

  // Utility: shuffle array
  const shuffleArray = (arr: any[]) => arr.sort(() => Math.random() - 0.5);

  // Escape regex for search
  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Build search keywords
  const searchKeywords = query.trim() ? query.trim().split(/\s+/) : [];

  // Build AND conditions for search (case-insensitive)
  const andConditions: any[] = searchKeywords.map((kw) => {
    const regex = { $regex: escapeRegex(kw), $options: "i" };
    if (isServiceProvider) {
      // Post search
      return { $or: [{ projectName: regex }, { category: regex }, { subCategory: regex }, { jobDescription: regex }] };
    } else {
      // Provider search
      return { $or: [{ fullName: regex }, { category: regex }, { subCategory: regex }, { description: regex }] };
    }
  });

  // Build category/subCategory filters
  const categoryFilter: any = {};
  if (category) categoryFilter.category = category;
  if (subCategory) categoryFilter.subCategory = subCategory;

  // Build geo filter if lat/lng provided
  let geoFilter: any = {};
  if (typeof lat === "number" && typeof lng === "number" && !Number.isNaN(lat) && !Number.isNaN(lng)) {
    geoFilter.latLng = { $geoWithin: { $centerSphere: [[lng, lat], distance / 6378.1] } };
  }

  if (isServiceProvider) {
    // Posts
    const queryObj: any = { ...categoryFilter, ...geoFilter };
    if (andConditions.length) queryObj.$and = andConditions;

    let posts = await Post.find(queryObj)
      .populate({
        path: "offers",
        populate: { path: "form", select: "fullName email phone address profileImage" },
      })
      .sort({ createdAt: -1 })
      .select("-latLng")
      .skip(skip)
      .limit(limit)
      .lean();

    // Fallback to random if empty and no query/category/subCategory
    if (!posts.length && !query && !category && !subCategory) {
      const allPosts = await Post.find().populate("offers").select("-latLng").lean();
      posts = shuffleArray(allPosts).slice(skip, skip + limit);
    }

    return posts;
  } else {
    // Providers
    const queryObj: any = { role: USER_ROLES.SERVICE_PROVIDER, accountStatus: ACCOUNT_STATUS.ACTIVE, ...categoryFilter, ...geoFilter };
    if (andConditions.length) queryObj.$and = andConditions;

    let providers = await User.find(queryObj)
      .select("-password -otpVerification -isSocialAccount -latLng -job -favouriteServices -iOffered -myOffer -orders -searchedCatagory -__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Fallback to random if empty and no query/category/subCategory
    if (!providers.length && !query && !category && !subCategory) {
      const allProviders = await User.find({ role: USER_ROLES.SERVICE_PROVIDER, accountStatus: ACCOUNT_STATUS.ACTIVE })
        .select("-password -otpVerification -isSocialAccount -latLng -job -favouriteServices -iOffered -myOffer -orders -searchedCatagory -__v")
        .lean();
      providers = shuffleArray(allProviders).slice(skip, skip + limit);
    }

    return providers;
  }
};

const allNotifications = async (
  payload: JwtPayload,
  query: NotificationQuery = {}
) => {
  const { userID } = payload;
  const { page = 1, limit = 20 } = query;

  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    Notification.find({ for: userID })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ for: userID })
  ]);

  return {
    data: notifications,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit)
  };
};

const addRating = async ( 
  payload: JwtPayload,
  data: TRating
) => {
  const { userID } = payload;
  const { feedback, star, orderID } = data;
  const order = await Order.findById(orderID);
  if (!order) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Order not founded!"
    );
  };
  if (order.customer.toString() !== userID.toString()) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "You are not authorize to give him a reating!"
    );
  }
  const provider = await User.findById(order.provider);
  if (!provider) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Provider not founded!"
    );
  };
  
  await RatingModel.create({
    customer: userID,
    provider: order.provider,
    post: order.post,
    rating: star,
    comment: feedback
  });

  return true;
};

const deleteNotification = async (
  ids: string[] 
) => {
  if (ids.length === 1) {
    await Notification.findByIdAndDelete(ids[0]);
  } else if ( ids.length > 1 ) {
    await Notification.deleteMany({
      _id: { $in: ids }
    })
  } else {
    throw new ApiError(
      StatusCodes.NOT_ACCEPTABLE,
      "You must give notification id to delete!"
    )
  }
};

const aProvider = async (payload: JwtPayload, id: string) => {
  const objID = new mongoose.Types.ObjectId(id);

  const provider = await User.findById(objID)
    .select(
      "-otpVerification -isSocialAccount -latLng -job -favouriteServices -iOffered -myOffer -orders -searchedCatagory -password -__v -favouriteProvider -deviceID -createdAt -updatedAt"
    )
    .lean()
    .exec() as IUser;

  if (!provider) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Provider not found!");
  }

  const user = await User.findById(payload.userID)
    .select("favouriteProvider")
    .lean() as IUser;

    //@ts-ignore
  const isFavorite = user?.favouriteProvider?.filter(
    (favId: any) => favId.toString() == provider._id.toString()
  ) || false;

  const enrichedRatings = await Promise.all(
    (provider.ratings || []).map(async (rating: any) => {
      try {
        if (!rating.from) return rating;

        const order = await User.findById(rating.from)
          .select("fullName profileImage email")
          .lean();

        return {
          ...rating,
          customer: order || null
        };
      } catch (err) {
        console.error("Failed to fetch order/customer for rating:", err);
        return rating;
      }
    })
  );

  const chat = await Chat.findOne({
    users:[
      new mongoose.Types.ObjectId(payload.userID),
      new mongoose.Types.ObjectId(id)
    ]
  })

  const totalServices = await Order.countDocuments({ provider: provider._id });
  const totalReviews = enrichedRatings.length;
  const totalStars = enrichedRatings.reduce((acc, cur) => acc + (cur.star || 0), 0);
  const agvRating = totalReviews > 0 ? totalStars / totalReviews : null;

  return {
    ...provider,
    ratings: enrichedRatings,
    totalReviews,
    agvRating,
    chatID: chat._id,
    totalServices,
    isFavorite: isFavorite.length > 0 ? true : false
  };
};

const allPost = async (
  payload: JwtPayload,
  pagination: any
) => {
  const user = await User.findById(payload.userID).select("-otpVerification -isSocialAccount -latLng -job -favouriteServices -iOffered -myOffer -orders -searchedCatagory -password -__v").lean().exec();

  const { page = 1, limit = 10 } = pagination;
  const skip = (page - 1) * limit;
  const total = await Post.countDocuments({});
  const results = await Post.find()
    .select("-latLng")
    .limit(limit)
    .skip(skip)
    .lean()
    .exec();

  return {
    data: results,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  };
};

const offerOnPost = async(
  payload: JwtPayload,
  data: any
) => {

  const { post_id: postID } = data;
  
  const post: any = await Post.findById(postID)
  if (!post) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "Post not founded!"
    )
  }

    try {
      const { userID } = payload;
      const {
        endDate,
        startDate,
        myBudget,
        validFor,
        description,
        companyImages
      } = data;
      const isUserExist = await User.findById(userID);

      if (!isUserExist) {
        throw new ApiError(
          StatusCodes.NOT_FOUND, 
          "User not found"
        );
      };

      const ifCustomerExist = await User.findById(post.creatorID);
      if (!ifCustomerExist) {
        throw new ApiError(
          StatusCodes.NOT_FOUND, 
          "User not found"
        );
      };

      if (
        isUserExist.accountStatus === ACCOUNT_STATUS.DELETE ||
        isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK
      ) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          `Your account was ${isUserExist.accountStatus.toLowerCase()}!`
        );
      };
      if (
        ifCustomerExist.accountStatus === ifCustomerExist.DELETE ||
        ifCustomerExist.accountStatus === ifCustomerExist.BLOCK
      ) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          `Your account was ${isUserExist.accountStatus.toLowerCase()}!`
        );
      };

      const offerData = {
        to: ifCustomerExist._id,
        form: isUserExist._id,
        budget: Number(myBudget),
        jobLocation: post.location,
        deadline: post.deadline,
        description,
        startDate,
        endDate,
        validFor,
        projectID: post._id,
        companyImages
      }
  
      const offer = await Offer.create(offerData);
  
      isUserExist.iOffered.push(offer._id);
      ifCustomerExist.myOffer.push(offer._id);
      await ifCustomerExist.save();
      await isUserExist.save();
  
      const notification = await Notification.create({
        for:ifCustomerExist._id,
        content: `You get a offer from ${isUserExist.fullName}`
      })
  
      //@ts-ignore
      const io = global.io;
      io.emit(`socket:${ifCustomerExist._id.toString()}`,notification)

      try {
        if (ifCustomerExist.deviceID) {
          await messageSend({
            notification: {
              title: `${isUserExist.fullName} send you a offer!`,
              body: `${description}`
            },
            token: ifCustomerExist.deviceID
          });
        }
      } catch (error) {
        console.log(error)
      }

      post.offers.push(offer._id);
      await post.save();
     
      return offer;
    } catch (error: any) {
      for (const img of data.companyImages) {
        unlinkFile(img);
      }
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      )
    }
};

const getReatings = async ( req: Request, res: Response ) => {
  try {
    const id = req.params.id;
    const objID = new mongoose.Types.ObjectId(id);
    const { page=1, limit=10 }: { page?: number; limit?: number } = req.query;

    const ratings = await RatingModel.find({ provider: objID })
      .populate("customer", "fullName email profileImage")
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();

    return res.status(StatusCodes.OK).json({
      data: ratings
    });
  } catch (error) {
    console.log(error)
  }
};

const totalOffersOnPost = async (
  payload: JwtPayload,
  postID: string
) => {
  const postObjId = new mongoose.Types.ObjectId( postID );

  const allOffers = await Offer
    .find({ projectID: postObjId })
    .populate("projectID", "coverImage showcaseImages projectName")
    .populate("form", "fullName profileImage")
    .sort({ updatedAt: -1 })
    .lean()

  const ratings = await Promise.all(
    allOffers.map(async (e: any) => {
      const ratings = await RatingModel.find({ provider: e.form._id });

      // Calculate average
      let average = 0;
      if (ratings.length > 0) {
        const total = ratings.reduce((sum, r) => sum + r.rating, 0);
        average = total / ratings.length;
      }

      return {
        _id: e._id,
        project: e.projectID,
        offerBy: {
          id: e.form._id,
          name: e.form.fullName,
          image: e.form.profileImage,
          averageRating: average,
          totalRatings: ratings.length
        },
        budget: e.budget,
        location: e.jobLocation,
        description: e.description,
      };
    })
  );

  return ratings
};

const doCounter = async (
  payload: JwtPayload,
  data: TOffer & { providerId: string },
  images: string[]
) => {
   try {
      const { userID } = payload;
      const {
        
        projectName,
        myBudget,
        category,
        location,
        deadline,
        validFor,
        description,
        to,
        endDate,
        startDate
      } = data;
      const isUserExist = await User.findById(userID);

      if (!isUserExist) {
        throw new ApiError(
          StatusCodes.NOT_FOUND, 
          "User not found"
        );
      };

      const ifCustomerExist = await User.findById(to);
      if (!ifCustomerExist) {
        throw new ApiError(
          StatusCodes.NOT_FOUND, 
          "User not found"
        );
      };

      if (
        isUserExist.accountStatus === ACCOUNT_STATUS.DELETE ||
        isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK
      ) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          `Your account was ${isUserExist.accountStatus.toLowerCase()}!`
        );
      };
      if (
        ifCustomerExist.accountStatus === ifCustomerExist.DELETE ||
        ifCustomerExist.accountStatus === ifCustomerExist.BLOCK
      ) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          `Your account was ${isUserExist.accountStatus.toLowerCase()}!`
        );
      };
  
      const offerData = {
        to: ifCustomerExist._id,
        form: isUserExist._id,
        projectName,
        category,
        budget: Number(myBudget),
        jobLocation: location,
        deadline,
        description,
        startDate,
        endDate,
        validFor:validFor,
        companyImages: images,
      }
  
      const offer = await Offer.create(offerData);
  
      isUserExist.iOffered.push(offer._id);
      ifCustomerExist.myOffer.push(offer._id);
      await ifCustomerExist.save();
      await isUserExist.save();
  
      const notification = await Notification.create({
        for:ifCustomerExist._id,
        content: `You get a offer from ${isUserExist.fullName}`
      })
  
      //@ts-ignore
      const io = global.io;
      io.emit(`socket:${to}`,notification)

      try {
        if (ifCustomerExist.deviceID) {
          await messageSend({
            notification: {
              title: `${isUserExist.fullName} send you a offer!`,
              body: `${description}`
            },
            token: ifCustomerExist.deviceID
          });
        }
      } catch (error) {
        console.log(error)
      }

     
      return offer;
    } catch (error: any) {
      for (const img of images) {
        unlinkFile(img);
      }
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        error.message
      )
    }
}

export const UserServices = {
    getPostsOrProviders,
    doCounter,
    totalOffersOnPost,
    getReatings,
    allPost,
    offerOnPost,
    aProvider,
    deleteNotification,
    addRating,
    getRequests,
    getAOffer,
    signUp,
    allNotifications,
    searchPosts,
    profle,
    UP,
    profileDelete,
    language,
    Images,
    createPost,
    accountStatus,
    privacy,
    conditions,
    post,
    favorite,
    getFavorite,
    removeFavorite,
    deleteJob,
    offers,
    UPost,
    singlePost,
    cOffer,
    intracatOffer,
    deleteOffer,
    supportRequest,
    iOfferd,
    getRecommendedPosts
};