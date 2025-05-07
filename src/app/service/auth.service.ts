import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError";
import User from "../../model/user.model";
import { SignInData } from "../../types/user"
import { jwtHelper } from "../../helpers/jwtHelper";
import { bcryptjs } from "../../helpers/bcryptHelper";


const signIn = async ( 
    payload : SignInData
) => {
    const { email, password } = payload;
    const isUser = await User.findOne({email});
    if (!isUser) {
        throw new ApiError(StatusCodes.NOT_FOUND,"Your account is not exist!")
    };

    const isTrue = await bcryptjs.compare(password, isUser.password);
    if (!isTrue) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"You passwort was wrong!")
    };

    const token = jwtHelper.createToken({language: isUser.language, role: isUser.role, userID: isUser._id});
    const { password: _password, ...userWithoutPassword } = isUser.toObject();

    return { token, user: userWithoutPassword }
}

export const AuthServices = {
    signIn
}