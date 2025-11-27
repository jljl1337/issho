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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const { setTheme, theme } = useTheme();

  const { pathname } = useLocation();

  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.contents")}</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem key="home">
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/home")}
              >
                <Link to="/home">
                  <Home />
                  {t("navigation.home")}
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
                  {t("sidebar.theme")}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value={theme}>
                  <DropdownMenuRadioItem
                    className="cursor-pointer"
                    value="system"
                    onSelect={() => setTheme("system")}
                  >
                    {t("sidebar.system")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    className="cursor-pointer"
                    value="light"
                    onSelect={() => setTheme("light")}
                  >
                    {t("sidebar.light")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    className="cursor-pointer"
                    value="dark"
                    onSelect={() => setTheme("dark")}
                  >
                    {t("sidebar.dark")}
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
              <Link to="/account">
                <User />
                {t("user.account")}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem key="about">
            <SidebarMenuButton asChild isActive={pathname === "/about"}>
              <Link to="/about">
                <Info />
                {t("navigation.about")}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
