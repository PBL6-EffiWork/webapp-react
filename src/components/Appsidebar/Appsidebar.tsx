// src/components/Appsidebar/Appsidebar.tsx
import { Calendar, Home, Inbox, FolderKanban, ChevronUp, User2, LogOut, CircleUser } from "lucide-react";
import { ReactComponent as Logo } from '../../assets/logo.svg';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavLink } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useConfirm } from "material-ui-confirm";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { logoutUserAPI } from "../../redux/user/userSlice";
import { Button } from "../ui/button";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Boards",
    url: "/boards",
    icon: FolderKanban,
  },
  {
    title: "Inbox",
    url: "/inbox",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: Calendar,
  },
];

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
];

export function AppSidebar() {
  const dispatch = useAppDispatch();
  const confirmLogout = useConfirm();

  const handleLogout = () => {
    confirmLogout({
      title: 'Log out of your account?',
      confirmationText: 'Confirm',
      cancellationText: 'Cancel'
    }).then(() => {
      dispatch(logoutUserAPI(true));
    }).catch(() => {});
  };

  return (
      <Sidebar>
        <SidebarHeader>
          <Logo width={200} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                            to={item.url}
                            className={({ isActive }) =>
                                isActive ? "active-class flex items-center p-2 rounded" : "flex items-center p-2 rounded"
                            }
                        >
                          <item.icon className="mr-2" /> {/* Add some margin to the icon */}
                          <span>{item.title}</span>
                        </NavLink>
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
                <User2 className="mr-2" /> {/* Add some margin to the icon */}
                Username
                <ChevronUp className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                side="top"
                className="w-full"
            >
              {profileItems.map((item) => (
                  <DropdownMenuItem key={item.title} asChild>
                    {item.url ? (
                        <NavLink
                            to={item.url}
                            className="flex items-center p-2 rounded hover:bg-gray-200"
                        >
                          <item.icon className="mr-2" />
                          <span>{item.title}</span>
                        </NavLink>
                    ) : (
                        <button
                            onClick={handleLogout}
                            className="flex items-center p-2 rounded hover:bg-gray-200 w-full text-left"
                        >
                          <item.icon className="mr-2" />
                          <span>{item.title}</span>
                        </button>
                    )}
                  </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
  );
}