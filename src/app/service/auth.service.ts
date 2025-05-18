import { StatusCodes } from "http-status-codes";
import ApiError from "../../errors/ApiError";
import User from "../../model/user.model";
import { SignInData } from "../../types/user"
import { jwtHelper } from "../../helpers/jwtHelper";
import { bcryptjs } from "../../helpers/bcryptHelper";
import generateOTP from "../../util/generateOTP";
import { emailTemplate } from "../../shared/emailTemplate";
import { emailHelper } from "../../helpers/emailHelper";
import { IChangePassword, ISocalLogin } from "../../types/auth";
import { ACCOUNT_STATUS } from "../../enums/user.enums";

const signIn = async ( 
    payload : SignInData
) => {
    const { email, password, deviceID } = payload;
    const isUser = await User.findOne({email});
    if (!isUser) {
        throw new ApiError(StatusCodes.NOT_FOUND,"Your account is not exist!")
    };
    if (isUser.isSocialAccount.isSocal) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"Your account is a socal account you must login with the "+isUser.isSocialAccount.provider)
    }
    if ( isUser.accountStatus === ACCOUNT_STATUS.DELETE || isUser.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUser.accountStatus.toLowerCase()}!`)
    };

    const isTrue = await bcryptjs.compare(password, isUser.password);
    if (!isTrue) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"You passwort was wrong!")
    };

    isUser.deviceID = deviceID;

    const token = jwtHelper.createToken({language: isUser.language, role: isUser.role, userID: isUser._id});
    
    return { token, user: isUser }
}

const emailSend = async (
    payload : { email: string, verificationType: "FORMAT_PASSWORD" | "CHANGE_PASSWORD" | "ACCOUNT_VERIFICATION" }
) => {
    const { email } = payload;
    const isUser = await User.findOne({email});
    if (!isUser) {
        throw new ApiError(StatusCodes.NOT_FOUND,`No account exists with this ( ${email} ) email`)
    };

    if ( isUser.accountStatus === ACCOUNT_STATUS.DELETE || isUser.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUser.accountStatus.toLowerCase()}!`)
    };

    if (isUser.isSocialAccount.isSocial) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,`Your can't set your password on your account because you have create your user with socal credentials!`)
    }
    
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
      
    return { user:isUser }
}

const verifyOtp = async (
    payload : { email: string, otp: string }
) => {
    const { email, otp } = payload;
    const isUser = await User.findOne({email});
    if (!isUser) {
        throw new ApiError(StatusCodes.NOT_FOUND,`No account exists with this ( ${email} ) email`)
    };

    if ( isUser.accountStatus === ACCOUNT_STATUS.DELETE || isUser.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUser.accountStatus.toLowerCase()}!`)
    };

    if (otp !== isUser.otpVerification.otp && !isUser.otpVerification.isVerified && isUser.otpVerification.time < new Date( Date.now() )) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"Your otp verification in not acceptable for this moment!")
    };

    await User.findByIdAndUpdate({_id: isUser._id},{$set: {
        "otpVerification.isVerified.status": true,
        "otpVerification.isVerified.time": new Date(Date.now() + 10 * 60 * 1000)
    }});

    await User.updateOne(
        { email },
        {
          $set: {
            'otpVerification.otp': 0,
            'otpVerification.time': new Date(),
            'otpVerification.verificationType': ""
          },
        }
    );
      
    return true;
}

const changePassword = async (
    payload : IChangePassword
) => {
    const { email, currentPassword, password, confirmPassword, oparationType } = payload;
    const isUser = await User.findOne({email});
    if (!isUser) {
        throw new ApiError(StatusCodes.NOT_FOUND,`No account exists with this ( ${email} ) email`)
    };
    if ( isUser.accountStatus === ACCOUNT_STATUS.DELETE || isUser.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUser.accountStatus.toLowerCase()}!`)
    };
    if ( !isUser.otpVerification.isVerified.status ) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"Your verification date is over now you can't change the password!")
    };
    
    if ( isUser.otpVerification.isVerified.time < new Date( Date.now())  ) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"Your verification date is over now you can't change the password!")
    };
    
    if (password !== confirmPassword) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"Please check your new password and the confirm password!")
    };

    if ( oparationType === "CHANGE_PASSWORD" ) {
        
        const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, isUser.password)
        if (!isCurrentPasswordValid) {
            throw new ApiError(StatusCodes.BAD_REQUEST,"You have gived the wrong old password!")
        };

        const newPassword = await bcryptjs.Hash(password);

        await User.findByIdAndUpdate(isUser._id, {
            $set:{
                password: newPassword,
                "otpVerification.isVerified.status": false,
                "otpVerification.isVerified.time": new Date( 0 ),
            }
        });

    };

    if ( oparationType === "FORGET_PASSWORD" ) {
        const newPassword = await bcryptjs.Hash(password);

        await User.findByIdAndUpdate(isUser._id, {
            $set:{
                password: newPassword,
                "otpVerification.isVerified.status": false,
                "otpVerification.isVerified.time": new Date( 0 ),
            }
        });
    };
      
    return true;
} 

const socalLogin = async (
    {
        deviceID,
        provider,
        accountType
    } : ISocalLogin,
) => {
    const isUserExist = await User.findOne({
        'isSocialAccount.socialIdentity': deviceID
    });

    // Create user if there is not any user
    if ( isUserExist === null ) {
        const user = await User.create({
            'isSocialAccount.isSocial': true,
            'isSocialAccount.socialIdentity': deviceID,
            'isSocialAccount.provider': provider,
            role: accountType,
            password: "--",
            email: "--",
            fullName: "--"
        })
        
        const token = jwtHelper.createToken({language: "en", role: user.role, userID: user._id});
        return { token };
    };

    if ( isUserExist.accountStatus === ACCOUNT_STATUS.DELETE || isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUserExist.accountStatus.toLowerCase()}!`)
    };

    const token = jwtHelper.createToken({language: "en", role: isUserExist.role, userID: isUserExist});
    return { token };
} 

export const AuthServices = {
    signIn,
    emailSend,
    verifyOtp,
    changePassword,
    socalLogin
}