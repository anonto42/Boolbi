import { z } from "zod"


const offer = z.object({
    body: z.object({
        jobID: z.string({ required_error: "Please give the jobID"}),
        serviceProvider: z.string({required_error: "Give the provider ID"}),
        companyName:  z.string({required_error: "Give the companyName"}),
        catagory:  z.string({required_error: "Give the category"}),
        budget:  z.number({required_error: "Give the budget"}),
        description:  z.string({required_error: "Give the service discription"})
    })
})


export const Validator = {
    offer
}