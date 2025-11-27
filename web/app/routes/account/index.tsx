import { useEffect } from "react";
import { Link, useNavigate } from "react-router";

import { Languages, LogOut, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

import { useSession } from "~/contexts/session-context";

export default function Page() {
  const { t } = useTranslation();
  const { user, isLoggedIn, isLoading: sessionLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, sessionLoading, navigate]);

  useEffect(() => {
    document.title = `${t("user.account")} | Issho`;
  }, [t]);

  return (
    <>
      <div className="h-full flex items-center justify-center">
        <div className="h-full max-w-[90rem] flex-1 flex flex-col p-8 gap-4">
          <h1 className="text-4xl">{t("user.account")}</h1>
          <div>
            <p className="mb-2">
              {t("user.userId")}: {user?.id}
            </p>
            <p className="mb-2">
              {t("user.username")}: {user?.username}
            </p>
            <p className="mb-2">
              {t("user.role")}: {user?.role}
            </p>
            <p className="mb-2">
              {t("user.createdAt")}:{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleString()
                : "N/A"}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("user.general")}</CardTitle>
              <CardDescription>
                {t("user.manageAccountSettings")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Separator />
              {/* Change Username */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">
                    {t("user.changeUsername")}
                  </Label>
                  <p className="text-muted-foreground text-sm">
                    {t("user.changeUsernameDesc")}
                  </p>
                </div>
                <Button asChild>
                  <Link to="/account/change-username">
                    {t("user.changeUsername")}
                  </Link>
                </Button>
              </div>
              <Separator />
              {/* Change Password */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">
                    {t("user.changePassword")}
                  </Label>
                  <p className="text-muted-foreground text-sm">
                    {t("user.changePasswordDesc")}
                  </p>
                </div>
                <Button asChild>
                  <Link to="/account/change-password">
                    {t("user.changePassword")}
                  </Link>
                </Button>
              </div>
              <Separator />
              {/* Language Preference */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">{t("user.language")}</Label>
                  <p className="text-muted-foreground text-sm">
                    {t("user.changeLanguageDesc")}
                  </p>
                </div>
                <Button asChild>
                  <Link to="/account/language">
                    <Languages className="mr-2 h-4 w-4" />
                    {t("user.language")}
                  </Link>
                </Button>
              </div>
              <Separator />
              {/* Sign Out */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">{t("user.signOut")}</Label>
                  <p className="text-muted-foreground text-sm">
                    {t("user.signOutDesc")}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="cursor-pointer"
                  asChild
                >
                  <Link to="/account/sign-out">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("user.signOut")}
                  </Link>
                </Button>
              </div>
              <Separator />
              {/* Sign Out (all devices) */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">{t("user.signOutAll")}</Label>
                  <p className="text-muted-foreground text-sm">
                    {t("user.signOutAllDesc")}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="cursor-pointer"
                  asChild
                >
                  <Link to="/account/sign-out-all">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("user.signOutAll")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">
                {t("user.dangerZone")}
              </CardTitle>
              <CardDescription>{t("user.dangerZoneDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">{t("user.deleteAccount")}</Label>
                  <p className="text-muted-foreground text-sm">
                    {t("user.deleteAccountDesc")}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="cursor-pointer"
                  asChild
                >
                  <Link to="/account/delete">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t("user.deleteAccount")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
