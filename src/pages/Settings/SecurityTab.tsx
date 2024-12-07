'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { Lock, KeyRound, ShieldAlert, Loader2 } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { FIELD_REQUIRED_MESSAGE, PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from '../../utils/validators'
import FieldErrorAlert from '../../components/Form/FieldErrorAlert'
import { selectCurrentUser, updateUserAPI, logoutUserAPI } from '../../redux/user/userSlice'
import { useAppDispatch } from '../../hooks/useAppDispatch'

function SecurityTab() {
  const dispatch = useAppDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const [isUpdating, setIsUpdating] = useState(false)

  interface FormData {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>()

  const submitChangePassword = async (data: FormData) => {
    const { current_password, new_password } = data

    setIsUpdating(true)
    try {
      const res = await dispatch(updateUserAPI({ current_password, new_password }))
      if (res.type.endsWith('/fulfilled')) {
        toast.success('Successfully changed your password, please login again!')
        dispatch(logoutUserAPI(false))
      }
    } catch (error) {
      toast.error('Failed to change password')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="max-w-[1200px] flex flex-col items-center justify-center gap-8 bg-white p-8 rounded-lg">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldAlert className="w-12 h-12 text-primary" />
          </div>
          <div className="flex flex-col gap-1 w-96">
            <h2 className="text-2xl font-bold">Security Settings</h2>
            <p className="text-muted-foreground">Manage your account security</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(submitChangePassword)} className="w-full max-w-md min-w-96 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="current_password">Current Password</Label>
            <div className="relative">
              <KeyRound className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="current_password"
                type="password"
                placeholder="Enter your current password"
                autoComplete="current-password"
                className="pl-8"
                {...register('current_password', {
                  required: FIELD_REQUIRED_MESSAGE,
                  pattern: {
                    value: PASSWORD_RULE,
                    message: PASSWORD_RULE_MESSAGE
                  }
                })}
              />
            </div>
            {errors.current_password && <FieldErrorAlert errors={errors} fieldName={'current_password'} />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="new_password"
                type="password"
                placeholder="Enter your new password"
                autoComplete="new-password"
                className="pl-8"
                {...register('new_password', {
                  required: FIELD_REQUIRED_MESSAGE,
                  pattern: {
                    value: PASSWORD_RULE,
                    message: PASSWORD_RULE_MESSAGE
                  }
                })}
              />
            </div>
            {errors.new_password && <FieldErrorAlert errors={errors} fieldName={'new_password'} />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password_confirmation">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="new_password_confirmation"
                type="password"
                placeholder="Confirm your new password"
                autoComplete="new-password"
                className="pl-8"
                {...register('new_password_confirmation', {
                  validate: (value) => {
                    if (value === watch('new_password')) return true
                    return 'Password confirmation does not match.'
                  }
                })}
              />
            </div>
            {errors.new_password_confirmation && <FieldErrorAlert errors={errors} fieldName={'new_password_confirmation'} />}
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" className="w-full" disabled={isUpdating}>
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Change Password'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  You have to login again after successfully changing your password. Continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit(submitChangePassword)}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </form>
      </div>
    </div>
  )
}

export default SecurityTab

