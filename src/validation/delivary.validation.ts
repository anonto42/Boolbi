import { z } from "zod"
import { DELIVERY_STATUS } from "../enums/delivery.enum"

const createRequest = z.object({
    body: z.object({
        projectDoc: z.string({required_error:"You must give the project documentation for send a delivery request"}),
        uploatedProject: z.string({required_error:"You must give the information of the project"}),
        orderID: z.string({required_error:"You must give the id to make the order request"})
    })
})

const acceptdelivaryRequestZodSchema = z.object({
    body: z.object({
        requestID: z.string({required_error:"You must give the request id to accept"}),
        acction: z.enum(["DECLINE", "APPROVE"])
    })
})

const timeExtendDelivaryRequestZodSchema = z.object({
    body: z.object({
        orderID: z.string({required_error:"You must give the order id"}),
        nextDate: z.string({required_error:"You must give the next date"}),        
        reason: z.string({required_error:"You must give the reason"}),
    })
})

const timeExtendDelivaryRequestIntraction = z.object({
    body: z.object({
        requestID: z.string({required_error:"You must give the order id"}),
        acction: z.enum([ DELIVERY_STATUS.APPROVE, DELIVERY_STATUS.DECLINE ]),
    })
})


export const DelivaryValidation = {
    createRequest,
    acceptdelivaryRequestZodSchema,
    timeExtendDelivaryRequestZodSchema,
    timeExtendDelivaryRequestIntraction
}