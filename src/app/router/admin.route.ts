import { Router } from "express";
import auth from "../../middlewares/Auth.middleware";
import { USER_ROLES } from "../../enums/user.enums";
import validateRequest from "../../middlewares/validateRequest";
import { ProviderController } from "../controller/provider.controller";
import { OrderValidator } from "../../validation/order.validation";
import { DelivaryValidation } from "../../validation/delivary.validation";
import fileUploadHandler from "../../middlewares/fileUploadHandler";


const router = Router();

export const AdminRoter = router;