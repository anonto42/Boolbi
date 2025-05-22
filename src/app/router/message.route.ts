import { Router } from "express";
import { USER_ROLES } from "../../enums/user.enums";
import auth from "../../middlewares/Auth.middleware";
import { MessageController } from "../controller/message.controller";
import validateRequest from "../../middlewares/validateRequest";
import { MessageValidation } from "../../validation/message.validation";

const router = Router();

router
    .route("/chat")
    .get(
        auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.SERVICE_PROVIDER, USER_ROLES.USER ),
        validateRequest( MessageValidation.getChatRroom ),
        MessageController.singleChatRoom
    )
    .post(
        auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.SERVICE_PROVIDER, USER_ROLES.USER ),
        validateRequest( MessageValidation.createChatRoom ),
        MessageController.createChat
    )
    .delete(
        auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.SERVICE_PROVIDER, USER_ROLES.USER ),
        validateRequest( MessageValidation.deleteRoom ),
        MessageController.deleteChat
    )

router
    .route("/all-chat")
    .get(
        auth( USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.SERVICE_PROVIDER, USER_ROLES.USER ),
        MessageController.chatRooms
    )

export const MessageRoute = router;