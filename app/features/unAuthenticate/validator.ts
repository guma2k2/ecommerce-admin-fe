import z from 'zod'
import { validationMsg } from '~/shared/utils/appUtils'

export const loginFormSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, validationMsg('validation.required'))
    .email(validationMsg('validation.email')),
  password: z
    .string()
    .min(8, validationMsg('validation.minLength', { min: 8 }))
})

export type LoginFormSchema = z.infer<typeof loginFormSchema>
