import { z } from "zod"


const createRequest = z.object({
    body: z.object({
        projectDoc: z.string({required_error:"You must give the project documentation for send a delivery request"}),
        uploatedProject: z.string({required_error:"You must give the information of the project"}),
        orderID: z.string({required_error:"You must give the id to make the order request"})
    })
})



export const DelivaryValidation = {
    createRequest,
}