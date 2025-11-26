import { Link, useLocation } from "react-router";

import {
  Book,
  DollarSign,
  Edit,
  Home,
  Info,
  Laptop,
  List,
  Moon,
  Sun,
  Trash,
  User,
  Wallet,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

import { useTheme } from "~/components/theme-provider";

export function AppSidebar() {
  const { setTheme, theme } = useTheme();

  const { pathname } = useLocation();

  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Contents</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem key="home">
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/home")}
              >
                <Link to={"/home"}>
                  <Home />
                  Home
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="cursor-pointer">
                  {theme === "light" ? (
                    <Sun />
                  ) : theme === "dark" ? (
                    <Moon />
                  ) : (
                    <Laptop />
                  )}
                  Theme
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value={theme}>
                  <DropdownMenuRadioItem
                    className="cursor-pointer"
                    value="system"
                    onSelect={() => setTheme("system")}
                  >
                    System
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    className="cursor-pointer"
                    value="light"
                    onSelect={() => setTheme("light")}
                  >
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    className="cursor-pointer"
                    value="dark"
                    onSelect={() => setTheme("dark")}
                  >
                    Dark
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarMenuItem key="account">
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/account")}
            >
              <Link to={"/account"}>
                <User />
                Account
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem key="about">
            <SidebarMenuButton asChild isActive={pathname === "/about"}>
              <Link to={"/about"}>
                <Info />
                About
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
