import { useEffect } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/change-username";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type z from "zod";

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
import { useUpdateUsername } from "~/hooks/use-user";
import { translateError } from "~/lib/db/common";
import { usernameSchema } from "~/lib/schemas/auth";

export default function Page() {
  const { t } = useTranslation();
  const { csrfToken, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();
  const updateUsernameMutation = useUpdateUsername();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  const form = useForm<z.infer<typeof usernameSchema>>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: "",
    },
  });

  const { setError } = form;

  async function onSubmit(values: z.infer<typeof usernameSchema>) {
    if (!csrfToken) {
      setError("root", {
        message: t("user.noCsrfToken"),
      });
      return;
    }

    try {
      await updateUsernameMutation.mutateAsync({
        newUsername: values.username,
        csrfToken,
      });
      navigate("/account");
    } catch (error) {
      setError("root", {
        message: translateError(error),
      });
    }
  }

  const isSubmitting = updateUsernameMutation.isPending;
  const errors = form.formState.errors;

  return (
    <>
      <title>{t("user.changeUsername")} | Issho</title>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("user.changeUsername")}</CardTitle>
                <CardDescription>
                  {t("user.changeUsernameDesc")}
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
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("auth.username")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("user.newUsernamePlaceholder")}
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
