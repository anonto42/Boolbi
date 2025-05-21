import { z } from "zod"

const makePayment = z.object({
    body: z.object({
        offerId: z.string({ required_error:"You must give the offer id to process the next step"})
    })
})

export const PaymentValidation = {
    makePayment
}