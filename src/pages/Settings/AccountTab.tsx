'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { ActivityIcon as Attachment, Mail, User, Loader2, Upload, CheckIcon, UserRoundCog, UserRoundPen } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { FIELD_REQUIRED_MESSAGE, singleFileValidator } from '../../utils/validators'
import FieldErrorAlert from '../../components/Form/FieldErrorAlert'
import { selectCurrentUser, updateUserAPI } from '../../redux/user/userSlice'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { useTranslation } from 'react-i18next'

function UserAvatar({ user, onUpload }: { user: any, onUpload: (file: File) => void }) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const error = singleFileValidator(file)
    if (error) {
      toast.error(error)
      return
    }

    setIsUploading(true)
    try {
      await onUpload(file)
      toast.success('Avatar updated successfully!')
    } catch (error) {
      toast.error('Failed to update avatar')
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="relative">
      <Avatar className="w-24 h-24 border-4 border-background">
        <AvatarImage src={user?.avatar} alt={user?.displayName} />
        <AvatarFallback>{user?.displayName?.[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-0 right-0 rounded-full"
              disabled={isUploading}
            >
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Label>
              <Input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upload a new avatar</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

function AccountTab() {
  const dispatch = useAppDispatch()
  const currentUser = useSelector(selectCurrentUser)
  const [isUpdating, setIsUpdating] = useState(false)
  const { t } = useTranslation()

  const initialGeneralForm = {
    displayName: currentUser?.displayName
  }

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialGeneralForm
  })

  const submitChangeGeneralInformation = async (data: { displayName: string }) => {
    const { displayName } = data

    if (displayName === currentUser?.displayName) return

    setIsUpdating(true)
    try {
      const res = await dispatch(updateUserAPI({ displayName }))
      if (res.type.endsWith('/fulfilled')) {
        toast.success('User updated successfully!')
      }
    } catch (error) {
      toast.error('Failed to update user')
    } finally {
      setIsUpdating(false)
    }
  }

  const uploadAvatar = async (file: File) => {
    let reqData = new FormData()
    reqData.append('avatar', file)

    const res = await dispatch(updateUserAPI(reqData))
    if (res.type.endsWith('/rejected')) {
      throw new Error('Failed to update avatar')
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="max-w-[1200px] flex flex-col items-center justify-center gap-8 bg-white p-8 rounded-lg">
        <div className="flex items-center gap-6">
          <UserAvatar user={currentUser} onUpload={uploadAvatar} />
          <div className="flex flex-col gap-1 w-96">
            <h2 className="text-2xl font-bold line-clamp-2">{currentUser?.displayName}</h2>
            <p className="text-muted-foreground line-clamp-2">@{currentUser?.username}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(submitChangeGeneralInformation)} className="w-full max-w-md min-w-96 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Your Email</Label>
            <div className="relative">
              <Mail className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="email"
                type="email"
                placeholder="Your email"
                value={currentUser?.email}
                disabled
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Your Username</Label>
            <div className="relative">
              <User className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="username"
                type="text"
                placeholder="Your username"
                value={currentUser?.username}
                disabled
                className="pl-8"
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='role'>Your Role</Label>
            <div className='relative'>
              <UserRoundCog className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="role"
                type="text"
                value={t(`roles.${currentUser?.role}`)}
                disabled
                className="pl-8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Your Display Name</Label>
            <div className="relative">
              <UserRoundPen className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                id="displayName"
                type="text"
                placeholder="Your display name"
                className="pl-8"
                {...register('displayName', {
                  required: FIELD_REQUIRED_MESSAGE
                })}
              />
            </div>
            {errors.displayName && <FieldErrorAlert errors={errors} fieldName={'displayName'} />}
          </div>

          <Button type="submit" className="w-full" disabled={isUpdating}>
            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : 
              <>
                <span>Update</span>
              </>
            }
          </Button>
        </form>
      </div>
    </div>
  )
}

export default AccountTab

