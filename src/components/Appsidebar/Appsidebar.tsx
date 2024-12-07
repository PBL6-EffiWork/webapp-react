import { Calendar, Home, Inbox, Search, FolderKanban, ChevronUp, User2, Settings2, LogOut, CircleUser, CircuitBoard } from "lucide-react"
import { ReactComponent as Logo } from '../../assets/logo.svg'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { useConfirm } from "material-ui-confirm"
import { useAppDispatch } from "../../hooks/useAppDispatch"
import { logoutUserAPI, selectCurrentUser } from "../../redux/user/userSlice"
import { Button } from "../ui/button"
import { Box, Typography } from "@mui/material"
import { useTranslation } from "react-i18next"
import { useMemo } from "react"
import { useRole } from "../../context/RoleContext"
import { useSelector } from "react-redux"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"

// Menu items.
const items = [
  {
    title: "home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "board",
    url: "/boards",
    icon: FolderKanban,
  },
  {
    title: "inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "calendar",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "admin",
    url: "/admin",
    icon: CircuitBoard,
    role: "admin",
  }
]

export function AppSidebar() {
  const dispatch = useAppDispatch()
  const confirmLogout = useConfirm()
  const currentUser = useSelector(selectCurrentUser)
  const handleLogout = () => {
    confirmLogout({
      title: 'Log out of your account?',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel'
    }).then(() => {
      dispatch(logoutUserAPI(true))
    }).catch(() => {})
  }

  const { t } = useTranslation();

  const menuItems = useMemo(() => items.map((item) => ({
    ...item,
    title: t(`${item.title}`)
  })), [t])

  return (
    <Sidebar>
      <SidebarHeader >
        <Box className="flex items-center justify-center">
          <Logo width={30} height={30} />
          <span className="ml-2 font-semibold">Effiwork</span>
        </Box>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter((item) => !item.role || item.role === currentUser?.role)
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url}>
                        <item.icon className="text-xl" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton>
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                  <AvatarFallback>
                    {currentUser?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>{currentUser?.displayName}</span>
                <ChevronUp className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              className="w-[--radix-popper-anchor-width]"
            >
              <DropdownMenuItem asChild>
                <Link to={'/settings/account'}>
                  <div className="flex items-center gap-2 h-8">
                    <CircleUser />
                    <span>Profile</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to={'#'} onClick={handleLogout}>
                  <div className="flex items-center gap-2 h-8">
                    <LogOut />
                    <span>Logout</span>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
    </Sidebar>
  )
}
