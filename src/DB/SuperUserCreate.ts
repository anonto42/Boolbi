import config from "../config"
import { USER_ROLES } from "../enums/user.enums"
import { bcryptjs } from "../helpers/bcryptHelper";
import User from "../model/user.model"

export const superUserCreate = async () => {
    try {

        const isSuperUserExist = await User.findOne({ email: config.super_user_email, role: USER_ROLES.SUPER_ADMIN });
        if (isSuperUserExist) {
            return console.log("Your Database has a super admin and the email is : "+isSuperUserExist.email)    
        }

        const hasedPassword = await bcryptjs.Hash(config.super_user_password!);

        const superUserCreateData = {
            password: hasedPassword,
            email: config.super_user_email,
            role: USER_ROLES.SUPER_ADMIN
        }

        await User.create(superUserCreateData);

        console.log("you don't have any super user on your Database!");
        console.log("We have just create it right now")
        
    } catch (error) {
        console.log(error)
    }
}