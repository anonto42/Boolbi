import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { ProviderService } from "../service/provider.service";


const offer = catchAsync(
    async( req, res ) => {
        const user = (req as any)?.user;
        const {...Data} = req.body;
        const result = await ProviderService.offerCreation(user,Data);

        sendResponse(res, {
            success: true,
            statusCode: StatusCodes.OK,
            message: "Offer created successfully",
            data: result
        })
    }
)


export const ProviderController = {
    offer,
}