'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from '../../../interfaces/user'
import { useSelector } from 'react-redux'
import { selectBoardMembersId } from '../../../redux/board/boardSlice'
import { useTranslation } from 'react-i18next'

interface MembersProps {
  button?: React.ReactNode;
  members?: User[];
}

export default function Members({ button, members }: MembersProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { t } = useTranslation()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {button || <Button variant="outline">Members</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Members List</DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members?.map((member) => (
              <TableRow key={member._id}>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={member.avatar} alt={member.displayName} />
                    <AvatarFallback>{member.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>{member.displayName}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{t(`roles.${member.role}`)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}
