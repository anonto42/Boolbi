import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { AdminService } from "../service/admin.service";
import { ACCOUNT_STATUS } from "../../enums/user.enums";
import { getSingleFilePath } from "../../shared/getFilePath";

//overview of the dashoboard data
const overView = catchAsync(
    async( req: Request, res: Response ) => {
        const Payload = (req as any).user;
        const result = await AdminService.overview(Payload);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes .OK,
            message: "Admin overview data get successfully",
            data: result
        })
    }
)
// Have to make a user_admin_creator_function

const customers = catchAsync(
    async( req: Request, res: Response ) => {
        const Payload = (req as any).user;
        const specificUser = req.query.id;
        let result;
        if (!specificUser) {
            result = await AdminService.allCustomers(Payload);
        } else if ( specificUser ) {
            result = await AdminService.aCustomer(Payload,specificUser as string)
        }

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes .OK,
            message: "Successfully get all the customers",
            data: result
        });
    }
);

const updateAccountStatus = catchAsync(
    async( req: Request, res: Response ) => {
        const Payload = (req as any).user;
        const userAcction = req.query.acction;
        const userID = req.query.user;
        const result = await AdminService.updateUserAccountStatus(Payload,userID as string,userAcction as ACCOUNT_STATUS)

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes .OK,
            message: "Successfully updated the user account status",
            data: result
        });
    }
);

const providers = catchAsync(
    async( req: Request, res: Response ) => {
        const Payload = (req as any).user;
        const specificUser = req.query.id;
        let result;
        if (!specificUser) {
            result = await AdminService.allProvider(Payload);
        } else if ( specificUser ) {
            result = await AdminService.aCustomer(Payload,specificUser as string)
        }

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes .OK,
            message: "Successfully get all the providers",
            data: result
        });
    }
);

const payments = catchAsync(
    async( req: Request, res: Response ) => {
        const Payload = (req as any).user;
        const specificUser = req.query.id;
        let result;
        if (!specificUser) {
            result = await AdminService.allPayments(Payload);
        } else if ( specificUser ) {
            result = await AdminService.APayments(Payload,specificUser as string)
        }

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes .OK,
            message: "Successfully get all the payments",
            data: result
        });
    }
);

const catagroys = catchAsync(
    async( req: Request, res: Response ) => {
        const Payload = (req as any).user;
        const result = await AdminService.allCatagorys(Payload);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes .OK,
            message: "Successfully get all the catagorys",
            data: result
        });
    }
);

const newCatagroys = catchAsync(
    async( req: Request, res: Response ) => {
        const Payload = (req as any).user;
        const image = getSingleFilePath(req.files,"image");
        const { subCatagory } = req.body;
        const result = await AdminService.addNewCatagory(Payload,image as string,subCatagory);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes .OK,
            message: "Successfully get all the catagorys",
            data: result
        });
    }
);

const deleteCatagroys = catchAsync(
    async( req: Request, res: Response ) => {
        const Payload = (req as any).user;
        const catagoryID = req.query.id;
        const result = await AdminService.deleteCatagory(Payload,catagoryID as string);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes .OK,
            message: "Successfully deleted the catagorys",
            data: result
        });
    }
);

const updateCatagroys = catchAsync(
    async( req: Request, res: Response ) => {
        const Payload = (req as any).user;
        const {...data} = req.body;
        const image = getSingleFilePath(req.files,"image")
        const result = await AdminService.updateCatagory(Payload,data,image as string);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes .OK,
            message: "Successfully deleted the catagorys",
            data: result
        });
    }
);

export const AdminController = {
    overView,
    customers,
    updateAccountStatus,
    providers,
    payments,
    catagroys,
    newCatagroys,
    deleteCatagroys,
    updateCatagroys
}