import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError";
import User from "../../model/user.model";
import { ISignUpData } from "../../types/user"
import { jwtHelper } from "../../helpers/jwtHelper";
import { bcryptjs } from "../../helpers/bcryptHelper";
import { IUser } from "../../Interfaces/User.interface";
import { JwtPayload } from "jsonwebtoken";
import { IPhotos } from "../../Interfaces/post.interface";
import unlinkFile from "../../shared/unlinkFile";

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
    const { userID, role } = payload;

    const isExist = await User.findOne({_id: userID})
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"User not exist!")
    };

    return isExist
}

//Update the user profile
const UP = async ( 
    payload : JwtPayload,
    data : IUser
) => {
    const { userID } = payload;
    const { fullName, email, phone, city, address, postalCode, language, category, subCatagory, samplePictures, profileImage, serviceDescription } = data;

    const isExist = await User.findOne({_id: userID})
    if (!isExist) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"User not exist!")
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

    const user = await User.findOneAndUpdate(isUserExist._id,{ $set: { language }})

    return user
}

//


export const UserServices = {
    signUp,
    profle,
    UP,
    language,
    Images
}