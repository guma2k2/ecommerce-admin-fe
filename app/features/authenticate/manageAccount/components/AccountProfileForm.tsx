import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import {
  User as UserIcon,
  Mail,
  Camera,
  KeyRound,
  Save,
  RefreshCw,
  AlertCircle
} from 'lucide-react'

import { Button } from '~/core/components/shadcn/button'
import { Input } from '~/core/components/shadcn/input'
import { Separator } from '~/core/components/shadcn/separator'
import { Field, FieldLabel, FieldDescription, FieldError } from '~/core/components/shadcn/field'
import { accountProfileSchema, type AccountProfileSchema } from '../validator'

export interface AccountProfileFormProps {
  defaultValues?: Partial<AccountProfileSchema>
  userEmail: string
  onSubmit: (values: AccountProfileSchema) => void | Promise<void>
  isSubmitting?: boolean
  onAvatarChange?: (avatarUrl: string) => void
  onReset?: () => void
}

export default function AccountProfileForm({
  defaultValues,
  userEmail,
  onSubmit,
  isSubmitting = false,
  onAvatarChange,
  onReset
}: AccountProfileFormProps) {
  const { t } = useTranslation()

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty }
  } = useForm<AccountProfileSchema>({
    resolver: zodResolver(accountProfileSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      avatar: defaultValues?.avatar || ''
    }
  })

  // Sync form state when defaultValues change (e.g. initial fetch or refresh profile)
  useEffect(() => {
    reset({
      name: defaultValues?.name || '',
      avatar: defaultValues?.avatar || ''
    })
  }, [defaultValues?.name, defaultValues?.avatar, reset])

  // Watch avatar field for live preview updates in Identity Card
  const avatarValue = watch('avatar')
  useEffect(() => {
    onAvatarChange?.(avatarValue || '')
  }, [avatarValue, onAvatarChange])

  const handleResetForm = () => {
    reset({
      name: defaultValues?.name || '',
      avatar: defaultValues?.avatar || ''
    })
    onReset?.()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs space-y-8'
    >
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-bold text-gray-900 dark:text-gray-100'>Profile Details</h2>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Update your public display name and avatar URL.
          </p>
        </div>
        <KeyRound className='size-5 text-muted-foreground' />
      </div>

      <Separator className='bg-gray-100 dark:bg-zinc-800' />

      <div className='space-y-6'>
        {/* Display Name Field */}
        <Controller
          name='name'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='space-y-2'>
              <div className='flex items-center justify-between'>
                <FieldLabel htmlFor={field.name} className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                  {t('label.name')}
                </FieldLabel>
                <span className='text-xs font-normal text-muted-foreground'>Required</span>
              </div>
              <div className='relative'>
                <UserIcon className='absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
                <Input
                  {...field}
                  id={field.name}
                  placeholder='e.g. John Doe'
                  className='pl-10 h-11 text-sm'
                  disabled={isSubmitting}
                  aria-invalid={fieldState.invalid}
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              <FieldDescription className='text-xs text-muted-foreground'>
                This name will appear in top navigation, activity records, and greeting headers.
              </FieldDescription>
            </Field>
          )}
        />

        {/* Avatar URL Field */}
        <Controller
          name='avatar'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='space-y-2'>
              <div className='flex items-center justify-between'>
                <FieldLabel htmlFor={field.name} className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                  Avatar Image URL
                </FieldLabel>
                <span className='text-xs font-normal text-muted-foreground'>Optional</span>
              </div>
              <div className='relative'>
                <Camera className='absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
                <Input
                  {...field}
                  id={field.name}
                  placeholder='https://images.unsplash.com/...'
                  className='pl-10 h-11 text-sm'
                  disabled={isSubmitting}
                  aria-invalid={fieldState.invalid}
                />
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              <FieldDescription className='text-xs text-muted-foreground'>
                Provide a direct HTTPS link to an image (PNG, JPG, SVG, WebP).
              </FieldDescription>
            </Field>
          )}
        />

        {/* Readonly Email Field */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <label className='text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1'>
              {t('label.email')}
            </label>
            <span className='text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1'>
              <AlertCircle className='size-3' /> Read-only
            </span>
          </div>
          <div className='relative'>
            <Mail className='absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground' />
            <Input
              value={userEmail}
              readOnly
              disabled
              className='pl-10 h-11 text-sm bg-gray-100/70 dark:bg-zinc-800/60 cursor-not-allowed text-muted-foreground'
            />
          </div>
          <p className='text-xs text-muted-foreground'>
            Email address is linked to your primary login credentials and cannot be changed here.
          </p>
        </div>
      </div>

      <Separator className='bg-gray-100 dark:bg-zinc-800' />

      {/* Actions */}
      <div className='flex items-center justify-end gap-3'>
        <Button
          type='button'
          variant='outline'
          disabled={!isDirty || isSubmitting}
          onClick={handleResetForm}
          className='cursor-pointer'
        >
          Reset
        </Button>

        <Button
          type='submit'
          disabled={!isDirty || isSubmitting}
          className='cursor-pointer min-w-[130px]'
        >
          {isSubmitting ? (
            <>
              <RefreshCw className='size-4 mr-2 animate-spin' />
              Saving...
            </>
          ) : (
            <>
              <Save className='size-4 mr-2' />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
