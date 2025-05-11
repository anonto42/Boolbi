import { z } from "zod"

const single = z.object({
    query: z.object({
        orderID: z.string({ required_error:"You must give the order id to get the order infor mation!"}).optional()
    }).optional()
})

const deleteOrder = z.object({
    query: z.object({
        orderID: z.string({ required_error:"You must give the order id to delete the order"})
    })
})


export const OrderValidator = {
    single,
    deleteOrder
}