import { useEffect } from "react";
import { redirect, useNavigate } from "react-router";
import type { Route } from "./+types/change-password";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import z from "zod";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";

import { CenteredPage } from "~/components/layouts/centered-page";
import { useSession } from "~/contexts/session-context";
import { useUpdatePassword } from "~/hooks/use-user";
import { translateError } from "~/lib/db/common";
import { updatePasswordSchema } from "~/lib/schemas/auth";

export default function Page() {
  const { t } = useTranslation(["user", "auth", "common"]);
  const { csrfToken, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();
  const updatePasswordMutation = useUpdatePassword();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    document.title = `${t("changePassword")} | Issho`;
  }, [t]);

  const form = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const { setError } = form;

  async function onSubmit(values: z.infer<typeof updatePasswordSchema>) {
    if (!csrfToken) {
      setError("root", {
        message: t("noCsrfToken"),
      });
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        csrfToken,
      });
      navigate("/account");
    } catch (error) {
      setError("root", {
        message: translateError(error),
      });
    }
  }

  const isSubmitting = updatePasswordMutation.isPending;
  const errors = form.formState.errors;

  return (
    <CenteredPage>
      <Card className="w-sm">
        <CardHeader>
          <CardTitle>{t("changePassword")}</CardTitle>
          <CardDescription>{t("changePasswordDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("oldPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("oldPasswordPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("newPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("newPasswordPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("confirmPassword", { ns: "auth" })}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t("newPasswordPlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isSubmitting}
              >
                {t("save", { ns: "common" })}
              </Button>
              {errors.root?.message && !isSubmitting && (
                <div className="text-destructive text-sm text-center">
                  {errors.root?.message}
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </CenteredPage>
  );
}
