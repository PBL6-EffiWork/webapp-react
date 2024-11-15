import { Calendar, Home, Inbox, Search, FolderKanban, ChevronUp, User2, Settings2, LogOut, CircleUser } from "lucide-react"
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
import { logoutUserAPI } from "../../redux/user/userSlice"
import { Button } from "../ui/button"
import { Box, Typography } from "@mui/material"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Board",
    url: "/boards",
    icon: FolderKanban,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
]

const profileItems = [
  {
    title: "Profile",
    url: "/settings/account",
    icon: CircleUser,
  },
  {
    title: "Logout",
    icon: LogOut,
  },
]

export function AppSidebar() {
  const dispatch = useAppDispatch()
  const confirmLogout = useConfirm()
  const handleLogout = () => {
    confirmLogout({
      title: 'Log out of your account?',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel'
    }).then(() => {
      dispatch(logoutUserAPI(true))
    }).catch(() => {})
  }
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
              {items.map((item) => (
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
        {/* <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton>
                <User2 /> Username
                <ChevronUp className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              className="w-[--radix-popper-anchor-width]"
            >
              <DropdownMenuItem>
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Sign out</span>
              </DropdownMenuItem>
              {profileItems.map((item) => (
                <DropdownMenuItem key={item.title} asChild>
                  {item.url ? (
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  ) : (
                    <Link to={'#'} onClick={handleLogout}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter> */}
    </Sidebar>
  )
}
