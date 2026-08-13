import { useState } from 'react'
import { useNavigate } from 'react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import type { z } from 'zod'

import { Button } from '~/core/components/shadcn/button'
import { FieldGroup, FieldSet } from '~/core/components/shadcn/field'
import { showToast } from '~/shared/utils/toast'
import { fakeLoginApi } from '~/shared/services/api/authApi'
import { loginFormSchema, type LoginFormSchema } from '~/features/unAuthenticate/validator'
import { FormInput } from '~/shared/components/Form'
import { useAuthStore } from '~/stores'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const { control } = form

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    try {
      setIsLoading(true)
      const res = await fakeLoginApi(values)
      login(res.user, res.token)
      showToast('success', 'toasts.loginSuccess')
      navigate('/admin', { replace: true })
    } catch (error) {
      showToast('error', 'toasts.loginError')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex items-center justify-center w-full h-screen bg-gray-300'>
      <div className='w-md'>
        <FieldSet className='bg-white px-5 py-10 rounded-lg shadow-md'>
          <div className='text-center text-2xl font-medium mb-4'>Login</div>
          <form id='form-rhf-demo' onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <FormInput control={control} name='email' label='Email' placeholder='admin@example.com' />
              <FormInput
                control={control}
                name='password'
                label='Password'
                type='password'
                description='Must be at least 8 characters long.'
              />
              <Button type='submit' form='form-rhf-demo' className='w-full cursor-pointer' disabled={isLoading}>
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </FieldGroup>
          </form>
        </FieldSet>
      </div>
    </div>
  )
}
