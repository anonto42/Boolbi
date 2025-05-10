import { Router } from "express";
import auth from "../../middlewares/Auth.middleware";
import { USER_ROLES } from "../../enums/user.enums";
import validateRequest from "../../middlewares/validateRequest";
import { Validator } from "../../validation/provider.validation";
import { ProviderController } from "../controller/provider.controller";



const router = Router();

router
    .route("/")
    .get() // Get recomended job post





export const ProviderRoter = router;