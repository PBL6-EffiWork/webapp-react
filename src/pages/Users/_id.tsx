'use client'

import { useState } from 'react'
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
  const [user, setUser] = useState<User>({
    _id: "f16257a9-7b97-4782-8b51-09dc84cd5ced",
    email: "nguyendinhtu.job@gmail.com",
    username: "nguyendinhtu.job",
    displayName: "nguyendinhtu.job",
    avatar: "https://res.cloudinary.com/dijcunmcx/image/upload/v1732812935/users/cllznxjrqttspdg9f0hc.png",
    role: "admin",
    isActive: true,
    createdAt: 1731677725862,
    updatedAt: null
  })

  const handleActiveToggle = (checked: boolean) => {
    setUser(prevUser => ({ ...prevUser, isActive: checked }))
  }

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
                  <p className="capitalize">{user.role}</p>
                </div>
                <div>
                  <Label>Created At</Label>
                  <p>{format(user.createdAt, 'PPpp')}</p>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <p>{user.updatedAt ? format(user.updatedAt, 'PPpp') : 'Never'}</p>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={handleActiveToggle}
                      id="active-status"
                    />
                    <Label htmlFor="active-status">Active</Label>
                  </div>
                </div>
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

