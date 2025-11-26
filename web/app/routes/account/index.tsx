import { useEffect } from "react";
import { Link, useNavigate } from "react-router";

import { LogOut, Trash2 } from "lucide-react";

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
  const { user, isLoggedIn, isLoading: sessionLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, sessionLoading, navigate]);

  return (
    <>
      <title>Account | Issho</title>
      <div className="h-full flex items-center justify-center">
        <div className="h-full max-w-[90rem] flex-1 flex flex-col p-8 gap-4">
          <h1 className="text-4xl">Account</h1>
          <div>
            <p className="mb-2">User ID: {user?.id}</p>
            <p className="mb-2">Username: {user?.username}</p>
            <p className="mb-2">Role: {user?.role}</p>
            <p className="mb-2">
              Created At:{" "}
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleString()
                : "N/A"}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>General</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Separator />
              {/* Change Username */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Change Username</Label>
                  <p className="text-muted-foreground text-sm">
                    Change your account username
                  </p>
                </div>
                <Button asChild>
                  <Link to="/account/change-username">Change Username</Link>
                </Button>
              </div>
              <Separator />
              {/* Change Password */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Change Password</Label>
                  <p className="text-muted-foreground text-sm">
                    Change your account password
                  </p>
                </div>
                <Button asChild>
                  <Link to="/account/change-password">Change Password</Link>
                </Button>
              </div>
              <Separator />
              {/* Sign Out */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Sign Out</Label>
                  <p className="text-muted-foreground text-sm">
                    Sign out of your account on this device
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="cursor-pointer"
                  asChild
                >
                  <Link to="/account/sign-out">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Link>
                </Button>
              </div>
              <Separator />
              {/* Sign Out (all devices) */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Sign Out (all devices)</Label>
                  <p className="text-muted-foreground text-sm">
                    Sign out of your account on all devices
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="cursor-pointer"
                  asChild
                >
                  <Link to="/account/sign-out-all">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out (all devices)
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-base">Delete Account</Label>
                  <p className="text-muted-foreground text-sm">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button
                  variant="destructive"
                  className="cursor-pointer"
                  asChild
                >
                  <Link to="/account/delete">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
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
