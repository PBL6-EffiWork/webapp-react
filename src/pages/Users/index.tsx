'use client'

import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useTranslation } from 'react-i18next'
import { getDetailUserAPI } from '../../apis'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch } from '../../hooks/useAppDispatch'
import { getDetailsUserThunk, selectUserDetailView, selectUserError, updateUserThunk } from '../../redux/user/userSlice'
import { useSelector } from 'react-redux'

interface User {
  _id: string
  email: string
  username: string
  displayName: string
  avatar: string
  role: string
  isActive: boolean
  createdAt: number
  updatedAt: number | null
}

// Mock history data
const mockHistory = [
  { action: "Login", timestamp: 1731677725862 },
  { action: "Password changed", timestamp: 1731677725862 - 86400000 },
  { action: "Email updated", timestamp: 1731677725862 - 172800000 },
]
export default function UserDetailPage() {
  const user = useSelector(selectUserDetailView)
  const error = useSelector(selectUserError)

  const { userId } = useParams()

  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const roleRef = useRef<any>(null)


  const handleRoleChange = (newRole: string) => {
    if (!userId) {
      return
    }

    dispatch(updateUserThunk({
      userId,
      data: {
        role: newRole
      }
    }))
  }

  const handleDeactivate = () => {
  }

  useEffect(() => {
    if (!userId) {
      return
    }

    dispatch(getDetailsUserThunk(userId))
  }, [userId])

  useEffect(() => {
    if (error) {
      navigate('/404')
    }
  }, [error])

  if (!user || !user.displayName) {
    return null
  }

  console.log(user);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">User Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="information" className="w-full">
          <TabsList>
            <TabsTrigger value="information">Information</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="information">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={user.avatar} alt={user.displayName} />
                  <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">{user.displayName}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Username</Label>
                  <p>{user.username}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <Select
                    onValueChange={handleRoleChange} 
                    value={user.role}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">{t('roles.client')}</SelectItem>
                      <SelectItem value="manager">{t('roles.manager')}</SelectItem>
                      <SelectItem value="admin">{t('roles.admin')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Created At</Label>
                  <p>{format(user.createdAt, 'PPpp')}</p>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <p>{user.updatedAt ? format(user.updatedAt, 'PPpp') : 'Never'}</p>
                </div>
                {/* <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={handleActiveToggle}
                          id="active-status"
                        />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deactivate User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to deactivate this user? They will no longer be able to access the system.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeactivate}>Deactivate</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Label htmlFor="active-status">Active</Label>
                  </div>
                </div> */}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="history">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockHistory.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.action}</TableCell>
                    <TableCell>{format(item.timestamp, 'PPpp')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

