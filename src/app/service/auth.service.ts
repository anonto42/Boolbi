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
import { ACCOUNT_STATUS, USER_ROLES } from "../../enums/user.enums";
import { compare, hash } from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import adminDetails from "../../helpers/firebaseHelper";

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
    if (!isUser.userVerification) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "Your account is not verifyed! Please verify your account!"
        )
    }
    if ( isUser.accountStatus === ACCOUNT_STATUS.DELETE || isUser.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUser.accountStatus.toLowerCase()}!`)
    };

    const isTrue = await bcryptjs.compare(password, isUser.password);
    if (!isTrue) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE,"You passwort was wrong!")
    };

    isUser.deviceID = deviceID;
    await isUser.save()

    const token = jwtHelper.createToken({language: isUser.language, role: isUser.role, userID: isUser._id});
    
    return { token }
}

const emailSend = async (
    payload : { 
        email: string
    }
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
    };
    
    // generate otp
    const otp = generateOTP();

    //Send Mail
    const mail = emailTemplate.sendMail({otp, email,name: isUser.fullName, subjet: "Get OTP"});
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
      
    return { email:isUser.email };
}

const verifyOtp = async (
    payload : { 
        email: string, 
        otp: string
    }
) => {
    const { email, otp } = payload;
    const isUser = await User.findOne({email});
    
    if ( isUser.accountStatus === ACCOUNT_STATUS.DELETE || isUser.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUser.accountStatus.toLowerCase()}!`)
    };

    if (
        !otp && 
        !isUser.otpVerification.otp &&
        isUser.otpVerification.time < new Date( Date.now() )
    ) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "Your otp verification in not acceptable for this moment!")
    };

    if (isUser.otpVerification.otp !== otp) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "You given a wrone otp!"
        );
    };

    if ( !isUser.userVerification ) {
        await User.updateOne(
            { email },
            {
                $set: {
                    'otpVerification.otp': 0,
                    'otpVerification.time': new Date(),
                    "userVerification": true
                }
            }
        );
        return "Now your account is verifyed!"
    }

    const key = Math.floor(Math.random() * 1000000);
    const hasedKey = await hash(key.toString(),1);

    await User.updateOne(
        { email },
        {
          $set: {
            'otpVerification.otp': 0,
            'otpVerification.time': new Date(),
            'otpVerification.key': key.toString()
          }
        }
    );
      
    return { token: hasedKey };
}

const changePassword = async (
    payload : JwtPayload,
    data: {
        currentPassword: string,
        password: string,
        confirmPassword: string
    }
) => {
    const { userID } = payload;
    const { currentPassword, password, confirmPassword } = data;
    const isUser = await User.findById(userID);
    if (!isUser) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            `No account exists!`
        )
    };
    if ( 
        isUser.accountStatus === ACCOUNT_STATUS.DELETE || 
        isUser.accountStatus === ACCOUNT_STATUS.BLOCK 
    ) {
        throw new ApiError(
            StatusCodes.FORBIDDEN,
            `Your account was ${isUser.accountStatus.toLowerCase()}!`
        )
    };
    
    if (password !== confirmPassword) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "Please check your new password and the confirm password!"
        )
    };

    const isCurrentPasswordValid = await bcryptjs.compare(currentPassword, isUser.password)
    if (!isCurrentPasswordValid) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"You have gived the wrong old password!")
    };

    const newPassword = await bcryptjs.Hash(password);

    await User.findByIdAndUpdate(isUser._id, { password: newPassword });

    return true;
} 

const forgetPassword = async (
    payload : IChangePassword
) => {
    const { email, password, confirmPassword, token } = payload;
    const isUser = await User.findOne({email});
    if (!isUser) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            `No account exists with this ( ${email} ) email`
        )
    };
    if ( 
        isUser.accountStatus === ACCOUNT_STATUS.DELETE || 
        isUser.accountStatus === ACCOUNT_STATUS.BLOCK 
    ) {
        throw new ApiError(
            StatusCodes.FORBIDDEN,
            `Your account was ${isUser.accountStatus.toLowerCase()}!`
        )
    };
    
    if (password !== confirmPassword) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "Please check your new password and the confirm password!"
        )
    };

    if ( !isUser.otpVerification.key ) {
        throw new ApiError(
            StatusCodes.NOT_FOUND,
            "You don't have ganarate any token for change the password"
        )
    };

    const isValid = await compare( isUser.otpVerification.key ,token);
    if (!isValid) {
        throw new ApiError(
            StatusCodes.NOT_ACCEPTABLE,
            "You have inter a wrong token"
        )
    };

    const newPassword = await bcryptjs.Hash(password);
    await User.findByIdAndUpdate(isUser._id, {
        $set:{
            password: newPassword,
            "otpVerification.key": "",
        }
    });

    return true;
} 

const socalLogin = async (
    {
        uid,
        provider,
        email,
        displayName,
        deviceID
    } : ISocalLogin,
) => {
    const fireBaseToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjkyN2I4ZmI2N2JiYWQ3NzQ0NWU1ZmVhNGM3MWFhOTg0NmQ3ZGRkMDEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxNzgyNDgyMjAyNS1mZXJudHFlOW00YnJib3RqaDhydjdkcnNocms5NmU1cS5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6IjE3ODI0ODIyMDI1LTV2b2ZvZnFyMXM1Mzh2NXVnM241OGQ1N2NvYjM1bG42LmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTE3ODUwMTQ3NjkzODQ2NjA2OTcxIiwiZW1haWwiOiJ2aXJ0dWFsZnVuMjRAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJNZWRpYSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NKdzVrSXVXQXBJV2pQTmxwdnRpZXNkb082ZmlCbXRsTExkR3VjUHBFUGwzRkM5Umc9czk2LWMiLCJnaXZlbl9uYW1lIjoiTWVkaWEiLCJpYXQiOjE3NTg2MjM4MzUsImV4cCI6MTc1ODYyNzQzNX0.Y1XF3GdwzFFUujBDzEoNbN150NJiyboc4OJ6-Cc3CZLIgP5lBiGSmd-sR75CodioCV6xYZYob54UnyXcj-66OUhvuihDbRLcP4tRlh7mjD0XGKbqilNUwPZujI63LseZ-ZNsb4j4t-Z7txz4FRE8ALmN0qJzUoAxWdTn6KnUwimu8vgtBnKg7BvNJCxYRlvlh5P6hD0myoQOsIOEsHfgVrxLIsg5PQCzY"

    const decoded = await adminDetails.auth().verifyIdToken(fireBaseToken)

    return decoded

    const isUserExist = await User.findOne({
        'isSocialAccount.socialIdentity': uid
    });

    // Create user if there is not any user
    if ( isUserExist === null ) {
        const user = await User.create({
            'isSocialAccount.isSocial': true,
            'isSocialAccount.socialIdentity': uid,
            'isSocialAccount.provider': provider,
            deviceID: deviceID,
            role: USER_ROLES.USER,
            password: "--",
            email: email,
            fullName: displayName
        })
        
        const token = jwtHelper.createToken({language: "en", role: user.role, userID: user._id});
        return { token };
    };

    if ( isUserExist.accountStatus === ACCOUNT_STATUS.DELETE || isUserExist.accountStatus === ACCOUNT_STATUS.BLOCK ) {
        throw new ApiError(StatusCodes.FORBIDDEN,`Your account was ${isUserExist.accountStatus.toLowerCase()}!`)
    };

    const token = jwtHelper.createToken({language: "en", role: isUserExist.role, userID: isUserExist._id});
    
    return { token };
} 

const fcmToken = async (
    payload : JwtPayload,
    data: { deviceID: string }
) => {

    const { userID } = payload;
    const { deviceID } = data;
    const isUser = await User.findByIdAndUpdate(userID,{ deviceID }, { new: true });
    if (!isUser) {
        throw new ApiError(StatusCodes.NOT_FOUND,"Your account is not exist!")
    }
    return isUser.deviceID;
}

export const AuthServices = {
    signIn,
    fcmToken,
    emailSend,
    verifyOtp,
    changePassword,
    socalLogin,
    forgetPassword
}