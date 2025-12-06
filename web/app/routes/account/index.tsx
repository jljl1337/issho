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

import { VerticallyCenterPage } from "~/components/pages/vertically-center-page";
import { useLanguage } from "~/contexts/language-context";
import { useSession } from "~/contexts/session-context";
import { formatDateTime } from "~/lib/format/date";

export default function Page() {
  const { t } = useTranslation("user");
  const { user, isLoggedIn, isLoading: sessionLoading } = useSession();
  const { language } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, sessionLoading, navigate]);

  useEffect(() => {
    document.title = `${t("account")} | Issho`;
  }, [t]);

  return (
    <VerticallyCenterPage className="flex flex-col gap-4">
      <h1 className="text-4xl">{t("account")}</h1>
      <div>
        <p className="mb-2">
          {t("userId")}: {user?.id}
        </p>
        <p className="mb-2">
          {t("username")}: {user?.username}
        </p>
        <p className="mb-2">
          {t("email")}: {user?.email}
        </p>
        <p className="mb-2">
          {t("role")}: {user?.role ? t(`${user.role}Role`) : ""}
        </p>
        <p className="mb-2">
          {t("createdAt")}:{" "}
          {user?.createdAt
            ? formatDateTime(new Date(user.createdAt), language)
            : ""}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("general")}</CardTitle>
          <CardDescription>{t("manageAccountSettings")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />
          {/* Verify Email */}
          {!user?.isVerified && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">{t("verifyEmail")}</Label>
                  <p className="text-muted-foreground text-sm">
                    {t("verifyEmailDesc")}
                  </p>
                </div>
                <Button asChild>
                  <Link to="/account/verify-email">{t("verifyEmail")}</Link>
                </Button>
              </div>
              <Separator />
            </>
          )}
          {/* Change Username */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">{t("changeUsername")}</Label>
              <p className="text-muted-foreground text-sm">
                {t("changeUsernameDesc")}
              </p>
            </div>
            <Button asChild>
              <Link to="/account/change-username">{t("changeUsername")}</Link>
            </Button>
          </div>
          <Separator />
          {/* Change Email */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">{t("changeEmail")}</Label>
              <p className="text-muted-foreground text-sm">
                {t("changeEmailDesc")}
              </p>
            </div>
            <Button asChild>
              <Link to="/account/change-email">{t("changeEmail")}</Link>
            </Button>
          </div>
          <Separator />
          {/* Change Password */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">{t("changePassword")}</Label>
              <p className="text-muted-foreground text-sm">
                {t("changePasswordDesc")}
              </p>
            </div>
            <Button asChild>
              <Link to="/account/change-password">{t("changePassword")}</Link>
            </Button>
          </div>
          <Separator />
          {/* Language Preference */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">{t("language")}</Label>
              <p className="text-muted-foreground text-sm">
                {t("changeLanguageDesc")}
              </p>
            </div>
            <Button asChild>
              <Link to="/account/language">
                <Languages className="mr-2 h-4 w-4" />
                {t("language")}
              </Link>
            </Button>
          </div>
          <Separator />
          {/* Sign Out */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">{t("signOut")}</Label>
              <p className="text-muted-foreground text-sm">
                {t("signOutDesc")}
              </p>
            </div>
            <Button variant="destructive" className="cursor-pointer" asChild>
              <Link to="/account/sign-out">
                <LogOut className="mr-2 h-4 w-4" />
                {t("signOut")}
              </Link>
            </Button>
          </div>
          <Separator />
          {/* Sign Out (all devices) */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">{t("signOutAll")}</Label>
              <p className="text-muted-foreground text-sm">
                {t("signOutAllDesc")}
              </p>
            </div>
            <Button variant="destructive" className="cursor-pointer" asChild>
              <Link to="/account/sign-out-all">
                <LogOut className="mr-2 h-4 w-4" />
                {t("signOutAll")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">{t("dangerZone")}</CardTitle>
          <CardDescription>{t("dangerZoneDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base">{t("deleteAccount")}</Label>
              <p className="text-muted-foreground text-sm">
                {t("deleteAccountDesc")}
              </p>
            </div>
            <Button variant="destructive" className="cursor-pointer" asChild>
              <Link to="/account/delete">
                <Trash2 className="mr-2 h-4 w-4" />
                {t("deleteAccount")}
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </VerticallyCenterPage>
  );
}
