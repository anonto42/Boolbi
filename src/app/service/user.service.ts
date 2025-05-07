import { StatusCodes } from "http-status-codes";
import { USER_ROLES } from "../../enums/user.enums"
import ApiError from "../../errors/ApiError";
import User from "../../model/user.model";
import { ISignUpData } from "../../types/user"
import { jwtHelper } from "../../helpers/jwtHelper";
import { bcryptjs } from "../../helpers/bcryptHelper";
import { IUser } from "../../Interfaces/User.interface";

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
            language: user.language,
            role: user.role
        }
    )

    return { user: userObject, token: createToken }
}

export const UserServices = {
    signUp
}