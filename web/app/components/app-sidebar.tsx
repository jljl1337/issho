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
  const { t } = useTranslation(["sidebar", "navigation", "user"]);
  const { setTheme, theme } = useTheme();

  const { pathname } = useLocation();

  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("contents")}</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem key="home">
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/home")}
              >
                <Link to="/home">
                  <Home />
                  {t("home", { ns: "navigation" })}
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
                  {t("theme")}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuRadioGroup value={theme}>
                  <DropdownMenuRadioItem
                    className="cursor-pointer"
                    value="system"
                    onSelect={() => setTheme("system")}
                  >
                    {t("system")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    className="cursor-pointer"
                    value="light"
                    onSelect={() => setTheme("light")}
                  >
                    {t("light")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem
                    className="cursor-pointer"
                    value="dark"
                    onSelect={() => setTheme("dark")}
                  >
                    {t("dark")}
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
                {t("account", { ns: "user" })}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem key="about">
            <SidebarMenuButton asChild isActive={pathname === "/about"}>
              <Link to="/about">
                <Info />
                {t("about", { ns: "navigation" })}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
