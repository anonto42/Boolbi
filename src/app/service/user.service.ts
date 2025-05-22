import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError";
import User from "../../model/user.model";
import { FilterPost, ISignUpData, JobPost, TOffer } from "../../types/user"
import { jwtHelper } from "../../helpers/jwtHelper";
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
import { POST_TYPE } from "../../enums/post.enum";
import { messageSend } from "../../helpers/firebaseHelper";
import { socketHelper } from "../../helpers/socketHelper";
import { socketMessage } from "../../types/message";
import { MESSAGE_TYPE } from "../../enums/message.enum";

//User signUp
const signUp = async ( 
    payload : ISignUpData
) => {
    const { fullName, email, password, confirmPassword, phone, role } = payload;

    const isExist = await User.findOne({email: email});
    if (isExist) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"Email is alredy exist!")
    };

    if (password !== confirmPassword) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"Your password & confirmPassword must same!")
    };

    if(role !== "SERVICE_PROVIDER" && role !== "USER"){
        throw new ApiError(StatusCodes.BAD_REQUEST,`Your can't create your account with ( ${role} ) this role!`)
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
        throw new ApiError(StatusCodes.FAILED_DEPENDENCY,"We couldn't create your account due to an unexpected issue. Please try again later.")
    };

    const userObject = user.toObject();
    delete userObject.password;

    const createToken = jwtHelper.createToken(
        {
            userID: user._id,
            role: user.role,
        }
    )

    return { user: userObject, token: createToken }
}

//All Profile Information
const profle = async ( 
    payload : JwtPayload
) => {
    const { userID } = payload;

    const isExist = await User.findOne({_id: userID}).select("-password -otpVerification -isSocialAccount");
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"User not exist!")
    };

    if ( isExist.accountStatus === ACCOUNT_STATUS.DELETE || isExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isExist.accountStatus.toLowerCase()}!`)
    };

    return isExist
}

//Update user Profile
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

  // Dynamically compare and update only changed fields
  const fieldsToUpdate = [
    "fullName",
    "email",
    "phone",
    "city",
    "address",
    "postalCode",
    "language",
    "category",
    "subCatagory",
    "samplePictures",
    "serviceDescription"
  ];

  const dataForUpdate: Partial<IUser> = {};

  for (const field of fieldsToUpdate) {
    const newValue = data[field as keyof IUser];
    const oldValue = isExist[field as keyof IUser];

    // Only update if value has changed
    if (
      typeof newValue !== "undefined" &&
      JSON.stringify(newValue) !== JSON.stringify(oldValue)
    ) {
      dataForUpdate[field as keyof IUser] = newValue;
    }
  }

  if (Object.keys(dataForUpdate).length === 0) {
    return isExist; // Nothing to update
  }

  const updatedUser = await User.findByIdAndUpdate(
    isExist._id,
    { $set: dataForUpdate },
    { new: true }
  ).select("-password -otpVerification -isSocialAccount")

  return updatedUser;
};

//Delete Profile
const profileDelete = async (
    payload: JwtPayload
) => {
    const { userID } = payload;
    const isUser = await User.findById(userID);
    if ( !isUser ) {
        throw new ApiError(StatusCodes.BAD_GATEWAY,"Your account not exist!");        
    };

    if ( isUser.accountStatus === ACCOUNT_STATUS.DELETE || isUser.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUser.accountStatus.toLowerCase()}!`)
    };

    isUser.accountStatus = ACCOUNT_STATUS.DELETE;

    await isUser.save();

    return true;
}

//Profile images update
const Images = async ( 
    payload : JwtPayload,
    data : IPhotos,
    images: string[] | string
) => {
    const { userID } = payload;
    const { fildName } = data;
    if (!fildName) throw new ApiError(StatusCodes.BAD_REQUEST,"You must give the the name of your fild to add the images");

    const isExist = await User.findOne({_id: userID});
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"User not exist!")
    };
    
    if ( isExist.accountStatus === ACCOUNT_STATUS.DELETE || isExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isExist.accountStatus.toLowerCase()}!`)
    };

    if (fildName !== "profileImage" && images.length > 1) {

        if ( images.length < 2 ) unlinkFile(images[0])
        else (images as string[]).map( (e: any) => unlinkFile(e))

        throw new ApiError(StatusCodes.BAD_GATEWAY,"You are not able to do that!")
    };

    if (fildName === "profileImage") {
        await User.updateOne({_id: isExist._id},{ profileImage: images[0] })
        return images[0]
    };

    if ( fildName === "samplePictures") {
        await User.updateOne({_id: isExist._id},{ samplePictures: images })
        return images
    };

    if ( fildName !== "samplePictures" && fildName !== "profileImage" ) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"You give a wrong inpout on the fildName you must give profileImage or samplePictures")
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

    return true
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
        user = await User.findByIdAndUpdate(isUserExist._id,{accountActivityStatus: "INACTIVE" },{ new: true})
    }

    if ( isUserExist.accountActivityStatus === ACCOUTN_ACTVITY_STATUS.INACTIVE ) {
        user = await User.findByIdAndUpdate(isUserExist._id,{accountActivityStatus: "ACTIVE" },{ new: true })
    }

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
const jobPost =  async (
    payload: JwtPayload,
    data: JobPost,
    images: string[],
    coverImage: string
) => {
    const { userID } = payload;
    const {category, companyName, deadline, description, location, title, postType, subCatagory, lng, lat } = data;
    const isUserExist = await User.findOne({_id: userID });
    if (!isUserExist) {
        throw new ApiError(StatusCodes.NOT_FOUND,"User not founded");
    };
    
    if ( isUserExist.accountStatus === ACCOUNT_STATUS.DELETE || isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUserExist.accountStatus.toLowerCase()}!`)
    };

    const isJobExistWithTitle = await Post.findOne({title});
    if (isJobExistWithTitle) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,`A job already exist on named ${title}`);
    };

    if ( images?.length < 1 ) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"You must give at least one image to public the job post")
    };

    const jobData = {
        title,
        catagory: category,
        subCatagory,
        postType,
        companyName,
        location,
        deadline,
        coverImage,
        jobDescription: description,
        showcaseImages: images,
        creatorID: isUserExist._id,
        latLng: {
          lat: Number(lat),
          lng: Number(lng)
        },
    };
 
    const post = await Post.create(jobData);
    if (!post) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"Somting was problem on create the job pleas try again")
    };
    
    isUserExist.job.push(post._id as Types.ObjectId)
    await isUserExist.save() 

    return post;
}

//Wone Created jobs 
const post = async (
    payload: JwtPayload
) => {
    const { userID } = payload;
    const isUserExist = await User.findById(userID);
    if (!isUserExist) {
        throw new ApiError(StatusCodes.NOT_FOUND,"User not founded");
    };
    
    if ( isUserExist.accountStatus === ACCOUNT_STATUS.DELETE || isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUserExist.accountStatus.toLowerCase()}!`)
    };

    const jobs = await User.aggregate([
        {
            $match: { _id: isUserExist._id }
        },
        {
            $lookup: {
              from: "posts",
              let: { jobIds: "$job", userId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $in: ["$_id", "$$jobIds"] },
                        { $eq: ["$creatorID", "$$userId"] }
                      ]
                    }
                  }
                }
              ],
              as: "userPosts"
            }
        }
    ]) 

    return (jobs as any)[0].userPosts
}

//Update a job 
const UPost = async (
    payload: JwtPayload,
    body: {
      postID: string;
      [key: string]: any;
    }
  ) => {
    const { userID } = payload;
    body.latLng = { lat: body.lat, lng: body.lng };
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

    if (updateFields.coverImage) {
      unlinkFile(post.coverImage)
    }
  
    let isChanged = false;
  
    for (const key in updateFields) {
      if (
        Object.prototype.hasOwnProperty.call(updateFields, key) &&
        updateFields[key] !== undefined
      ) {
        // Special handling for showcaseImages array
        if (key === 'showcaseImages') {
          const oldImages = post.showcaseImages || [];
          const newImages = updateFields.showcaseImages;

          // Compare arrays: only update if they're different
          const hasChanged =
            oldImages.length !== newImages.length ||
            oldImages.some((img: any, idx: any) => img !== newImages[idx]);

          if (hasChanged) {
            // Remove all old images from storage
            for (const img of oldImages) {
              unlinkFile(img); // 👈 your custom file deletion function
            }

            post.showcaseImages = newImages;
            isChanged = true;
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

    isUserExist.job = isUserExist.job.filter((e: any) => e.toString() !== postID);
    await isUserExist.save();
  
    const deletedPost = await Post.findByIdAndDelete(postID);
    if (!deletedPost) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Post not found");
    }
  
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
  
    const post = await Post.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(postID)
            }
        },
        {
          $lookup: {
            from: "users",
            localField: "creatorID",
            foreignField: "_id",
            as: "creator"
          }
        },
        {
            $unwind: "$creator"
        },
        {
            $project:{
                "creator.password": 0,
                "creator.isSocialAccount": 0,                
                "creator.otpVerification": 0,
                // "creator.email": 1,
                // "creator.language": 1,
                // "creator.phone": 1,
                // title: 1,
                // catagory: 1,
                // subCatagory: 1,
                // companyName: 1,
                // location: 1,
                // deadline:1 ,
                // jobDescription: 1,
                // showcaseImages: 1,
                // createdAt: 1,
                // updatedAt: 1
            }
        }
    ])
  
    return post[0];
};
  
//Add to the favorite list 
const favorite = async (
    payload: JwtPayload,
    data: { postID: string }
) => {
    const { userID } = payload;
    const { postID } = data;

    const isUserExist = await User.findById(userID);
    if (!isUserExist) {
        throw new ApiError(StatusCodes.NOT_FOUND,"User not founded");
    };
    
    if ( isUserExist.accountStatus === ACCOUNT_STATUS.DELETE || isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUserExist.accountStatus.toLowerCase()}!`)
    };

    if (!postID) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"You must give the service _id")
    };

    if (isUserExist.favouriteServices.some((e: any) => e.toString() === postID)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "You have already added this service to your favorite list");
    }

    isUserExist.favouriteServices.push(postID);

    await isUserExist.save()

    return true;
}

//favorites list 
const getFavorite = async (
    payload: JwtPayload
) => {
    const { userID } = payload;
    const isUserExist = await User.findById(userID);
    if (!isUserExist) {
        throw new ApiError(StatusCodes.NOT_FOUND,"User not founded");
    };
    
    if ( isUserExist.accountStatus === ACCOUNT_STATUS.DELETE || isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUserExist.accountStatus.toLowerCase()}!`)
    };

    const jobs = await User.aggregate([
        {
            $match: { _id: isUserExist._id }
        },
        {
            $lookup: {
              from: "posts",
              localField: "favouriteServices",
              foreignField: "_id",
              as: "favourites"
            }
        },
    ]) 
    
    return (jobs as any)[0].favourites
}

//remove favorite 
const removeFavorite = async (
    payload: JwtPayload,
    Data: { postID: string }
) => {
    const { userID } = payload;
    const { postID } = Data;
    const isUserExist = await User.findById(userID);
    if (!isUserExist) {
        throw new ApiError(StatusCodes.NOT_FOUND,"User not founded");
    };
    
    if ( isUserExist.accountStatus === ACCOUNT_STATUS.DELETE || isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUserExist.accountStatus.toLowerCase()}!`)
    };
    const hasJob = isUserExist.favouriteServices.includes(postID);
    if (!hasJob) {
      throw new ApiError(StatusCodes.NOT_FOUND, "This post is not linked to your favorite");
    }

    isUserExist.favouriteServices = isUserExist.favouriteServices.filter((e: any) => e.toString() !== postID);
    await isUserExist.save();

    return true;
}

//My offers
const offers = async (payload: JwtPayload) => {
  const { userID } = payload;

  const isUserExist = await User.findById(userID).populate({
    path: "myOffer",
    populate: [
      { path: "to", select: "fullName email" },
      { path: "form", select: "fullName email" },
      { path: "postID", select: "title" }
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

  return isUserExist.myOffer; // now fully populated
};

//I Offered
const iOfferd = async (payload: JwtPayload) => {
  const { userID } = payload;

  const isUserExist = await User.findById(userID).populate({
    path: "iOffered",
    populate: [
      { path: "to", select: "fullName email" },
      { path: "form", select: "fullName email" },
      { path: "postID", select: "title" }
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

  return isUserExist.iOffered; // now fully populated
};

// Create order
const cOffer = async (
    payload: JwtPayload,
    data: TOffer,
    images: string[]
) => {
    const { userID } = payload;
    const {
      category,
      companyName,
      deadline,
      description,
      location,
      myBudget,
      postID,
      projectName,
      to
    } = data;
    const isUserExist = await User.findById(userID);
    if (!isUserExist) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    };
    const ifCustomerExist = await User.findById(to);
    if (!ifCustomerExist) {
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
        postID,
        companyName,
        projectName,
        category,
        budget: Number(myBudget),
        jobLocation: location,
        deadline,
        description,
        companyImages: images
    }

    const offer = await Offer.create(offerData);

    isUserExist.iOffered.push(offer._id);
    ifCustomerExist.myOffer.push(offer._id);
    await ifCustomerExist.save();
    await isUserExist.save();

    if (ifCustomerExist.deviceID) {
      await messageSend({
        notification: {
          title: `${companyName} send you a offer!`,
          body: `${description}`
        },
        token: ifCustomerExist.deviceID
      });
    }

    const message: socketMessage = {
      message: `${isUserExist.fullName} send you a message for ${offer.projectName} project.`,
      messageType: MESSAGE_TYPE.NOTIFICATION,
      sender: isUserExist.fullName
    }

    //@ts-ignore
    const io = global.io;
    io.emit(`socket:${ifCustomerExist._id}`,message)
   
    return offer;
}

// offer intraction
const intracatOffer = async(
    payload: JwtPayload,
    data: { 
      acction: "DECLINE" | "APPROVE",
      offerId: string
    }
)=>{
    const { userID } = payload;
    const { acction,offerId } = data;
    const isUserExist = await User.findById(userID);
    const isOfferExist = await Offer.findById(offerId);
    const to = await User.findById(isOfferExist.to);

    if (!isOfferExist) {
      throw new ApiError(StatusCodes.NOT_FOUND,"Offer not founded");
    };
    if (!isUserExist) {
      throw new ApiError(StatusCodes.NOT_FOUND,"User not founded");
    };
    if ( isUserExist.accountStatus === ACCOUNT_STATUS.DELETE || isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
      throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUserExist.accountStatus.toLowerCase()}!`)
    };

    if ( acction === "DECLINE") {
      isOfferExist.status = "DECLINE";
      const newArr = to.myOffer.filter( (e: any) => e !== data.offerId );
      to.myOffer = newArr;
       
      await to.save();
      await isOfferExist.save();
      return "Offer Decline"
    };

    const orderCreationData = {
      customer: isOfferExist.customer,
      serviceProvider: userID,
      deliveryDate: isOfferExist.deadline,
      totalPrice: isOfferExist.budget,
      offerID: isOfferExist._id,
      serviceID: isOfferExist.serviceID
    };
    
    const order = await Order.create(orderCreationData);

    isUserExist.orders.push(order._id)
    isOfferExist.status = "APPROVE"
    await isOfferExist.save();
    await isUserExist.save();

    return order;

}

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

    const offer = await Offer.findById(offerID);
    
    if (!offer) {
      throw new ApiError(StatusCodes.NOT_FOUND,"Offer not founded");
    };
    
    if (offer.form !== isUserExist._id) {
      throw new ApiError(StatusCodes.NOT_FOUND,"You are not authorize to do that acction!")
    };

    return offer;
}

// suport request
const supportRequest = async(
    payload: JwtPayload,
    {
      message,
      category
    }:{
      from: string,
      message: string,
      category: string,
    }
)=>{
    const { userID } = payload;
    if ( !message || !category ) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"You must give the required fields")
    };
    const isUserExist = await User.findById(userID);
    if (!isUserExist) {
        throw new ApiError(StatusCodes.NOT_FOUND,"User not founded");
    };
    if ( isUserExist.accountStatus === ACCOUNT_STATUS.DELETE || isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUserExist.accountStatus.toLowerCase()}!`)
    };

  // Create the support request in DB
  const support = await Support.create({
    from: isUserExist._id,
    catagory: category,
    message,
  });

  if (!support) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Support not created");
  }

  // Emit socket notification
  //@ts-ignore
  const io = global.io;
  
  const roomID = `support_${support._id}`;

  io.to(roomID).emit("receive notification", {
    roomID,
    userName: isUserExist.name,
    message,
    iconImage: isUserExist.profileImage || null,
    createdAt: new Date(),
  });

    return support;
}

// This funciton is for search some data
const searchPosts = async (
  payload: JwtPayload, 
  searchQuery: string
) => {
  const { userID } = payload;

  if (!searchQuery) {
    throw new ApiError(StatusCodes.NOT_ACCEPTABLE, "Search query is required.");
  }

  const user = await User.findById(userID);
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

  const postType = user.role === USER_ROLES.SERVICE_PROVIDER ? POST_TYPE.JOB : POST_TYPE.SERVICE;

  const updatedKeywords = user.searchedCatagory.filter(
    (term : any) => term.toLowerCase() !== searchQuery.toLowerCase()
  );

  updatedKeywords.unshift(searchQuery);

  user.searchedCatagory = updatedKeywords.slice(0, 5);
  await user.save();

  const posts = await Post.find({
    postType,
    title: { $regex: searchQuery, $options: "i" }
  }).sort({ createdAt: -1 });

  return posts;
};

// Recommended post types
const getRecommendedPosts = async (
  payload: JwtPayload
) => {
  const { userID } = payload;

  const user = await User.findById(userID);
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

  const postType = user.role === USER_ROLES.SERVICE_PROVIDER ? POST_TYPE.JOB : POST_TYPE.SERVICE;

  if (user.searchedCatagory.length > 0) {
    const regexQueries = user.searchedCatagory.map((keyword: any) => ({
      title: { $regex: keyword, $options: "i" }
    }));

    return await Post.find({
      postType,
      $or: regexQueries
    }).sort({ createdAt: -1 });
  }

  return await Post.find({ postType }).sort({ createdAt: -1 }).limit(10);
};

const dataForTheFilter = async (payload: JwtPayload, data: FilterPost) => {
  const { userID } = payload;
  const { category, lat, lng, serviceRating, subCategory } = data;

  const user = await User.findById(userID);
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

  const matchStage: any = {};

  if (category) matchStage.category = category;
  if (subCategory) matchStage.subCategory = subCategory;

  // Default rating is 0 if not provided
  const minRating = serviceRating ?? 0;

  const posts = await Post.aggregate([
    {
      $addFields: {
        averageRating: { $avg: "$ratings.stars" }
      }
    },
    {
      $match: {
        ...matchStage,
        averageRating: { $gte: minRating }
      }
    }
  ]);

  return posts;
};


export const UserServices = {
    dataForTheFilter,
    signUp,
    searchPosts,
    profle,
    UP,
    profileDelete,
    language,
    Images,
    jobPost,
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
    getRecommendedPosts,
    iOfferd
}