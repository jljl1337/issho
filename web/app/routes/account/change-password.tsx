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

import { useSession } from "~/contexts/session-context";
import { useUpdatePassword } from "~/hooks/use-user";
import { translateError } from "~/lib/db/common";
import { updatePasswordSchema } from "~/lib/schemas/auth";

export default function Page() {
  const { t } = useTranslation();
  const { csrfToken, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();
  const updatePasswordMutation = useUpdatePassword();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    document.title = `${t("user.changePassword")} | Issho`;
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
        message: t("user.noCsrfToken"),
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
    <>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("user.changePassword")}</CardTitle>
                <CardDescription>
                  {t("user.changePasswordDesc")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="oldPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("user.oldPassword")}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={t("user.oldPasswordPlaceholder")}
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
                          <FormLabel>{t("user.newPassword")}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={t("user.newPasswordPlaceholder")}
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
                          <FormLabel>{t("auth.confirmPassword")}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={t("user.newPasswordPlaceholder")}
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
                      {t("common.save")}
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
          </div>
        </div>
      </div>
    </>
  );
}
