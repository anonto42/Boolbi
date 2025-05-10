import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError";
import User from "../../model/user.model";
import { ISignUpData, JobPost } from "../../types/user"
import { jwtHelper } from "../../helpers/jwtHelper";
import { bcryptjs } from "../../helpers/bcryptHelper";
import { IUser } from "../../Interfaces/User.interface";
import { JwtPayload } from "jsonwebtoken";
import { IPhotos } from "../../Interfaces/post.interface";
import unlinkFile from "../../shared/unlinkFile";
import Post from "../../model/post.model";
import { Types } from "mongoose";
import { ACCOUNT_STATUS, ACCOUTN_ACTVITY_STATUS, USER_ROLES } from "../../enums/user.enums";

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

//All Profile Information // aggrigation will use later in hear
const profle = async ( 
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

    return isExist
}

//Update the user profile
const UP = async ( 
    payload : JwtPayload,
    data : IUser
) => {
    const { userID } = payload;
    const { fullName, email, phone, city, address, postalCode, language, category, subCatagory, samplePictures, serviceDescription } = data;

    const isExist = await User.findOne({_id: userID})
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"User not exist!")
    };
    
    if ( isExist.accountStatus === ACCOUNT_STATUS.DELETE || isExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isExist.accountStatus.toLowerCase()}!`)
    };

    const dataForUpdate = { 
        fullName, 
        email, 
        phone, 
        city, 
        address, 
        postalCode, 
        language, 
        category, 
        subCatagory, 
        samplePictures,
        serviceDescription 
    }

    const updatedUser = await User.findOneAndUpdate({_id: isExist._id},dataForUpdate)

    return updatedUser
}

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

    const user = await User.findOneAndUpdate(isUserExist._id,{ $set: { language }})

    return user
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

//Create job post
const jobPost =  async (
    payload: JwtPayload,
    data: JobPost,
    images: string[]
) => {
    const { userID } = payload;
    const {category, companyName, deadline, description, location, title, postType, subCatagory} = data;
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
        jobDescription: description,
        showcaseImages: images,
        creatorID: isUserExist._id
    };
 
    const post = await Post.create(jobData);
    if (!post) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"Somting was problem on create the job pleas try again")
    };

    await isUserExist?.post?.push(post._id as Types.ObjectId)

    return post;
}

export const UserServices = {
    signUp,
    profle,
    UP,
    profileDelete,
    language,
    Images,
    jobPost,
    accountStatus,
    privacy,
    conditions
}