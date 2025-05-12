import { z } from "zod"

const addCard = z.object({
    body: z.object({
        card_holder_name: z.string({ required_error:"You must give the card holder name!"}),
        card_exp_year: z.string({ required_error:"You must give the card expiry year"}),
        card_exp_month: z.string({ required_error:"You must give the card expiry month"}),
        card_number: z.string({ required_error:"You must give the card number"}),
        card_cvc: z.string({ required_error:"You must give the CVC"})
    })
});

const makePayment = z.object({
    query: z.object({
        amount: z.string({required_error:"You must give the amount of your payment"}),
        orderID: z.string({required_error:"You must give the order id that you want to order."})
    })
})

export const PaymentValidation = {
    addCard
}