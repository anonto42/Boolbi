import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError";
import User from "../../model/user.model";
import { SignInData } from "../../types/user"
import { jwtHelper } from "../../helpers/jwtHelper";
import { bcryptjs } from "../../helpers/bcryptHelper";
import generateOTP from "../../util/generateOTP";
import { emailTemplate } from "../../shared/emailTemplate";
import { emailHelper } from "../../helpers/emailHelper";


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

const emailSend = async (
    payload : { email: string, verificationType: "FORMAT_PASSWORD" | "CHANGE_PASSWORD" | "ACCOUNT_VERIFICATION" }
) => {
    const { email } = payload;
    const isUser = await User.findOne({email});
    if (!isUser) {
        throw new ApiError(StatusCodes.NOT_FOUND,`No account exists with this ( ${email} ) email`)
    };
    
    // generate otp
    const otp = generateOTP();

    //Send Mail
    const forgetPassword = emailTemplate.sendMail({otp, email,name: isUser.fullName, subjet: payload.verificationType});
    emailHelper.sendEmail(forgetPassword);

    await User.updateOne(
        { email },
        {
          $set: {
            'otpVerification.otp': otp,
            'otpVerification.time': new Date(Date.now() + 3 * 60000),
            'otpVerification.verificationType': payload.verificationType,
          },
        }
    );
      
    return {}
}


export const AuthServices = {
    signIn,
    emailSend,
}