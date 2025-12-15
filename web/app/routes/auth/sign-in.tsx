import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import type { Route } from "./+types/sign-in";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

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

import { LanguageSwitcher } from "~/components/language-switcher";
import { CenteredPage } from "~/components/layouts/centered-page";
import { useSession } from "~/contexts/session-context";
import { usePreSession, useSignIn } from "~/hooks/use-auth";
import { translateError } from "~/lib/db/common";

export default function Page() {
  const { t } = useTranslation(["auth", "common"]);
  const { refreshSession, csrfToken, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();

  const formSchema = z.object({
    username: z.string().trim().min(1, t("usernameRequired")),
    password: z.string().min(1, t("passwordRequired")),
  });

  const preSessionMutation = usePreSession();
  const signInMutation = useSignIn();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      navigate("/home");
    }
  }, [isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    document.title = `${t("signIn")} | Issho`;
  }, [t]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { setError } = form;

  // Create pre-session on mount if no CSRF token exists
  useEffect(() => {
    if (!csrfToken && !preSessionMutation.isPending) {
      preSessionMutation.mutate();
    }
  }, [csrfToken, preSessionMutation]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const tokenToUse = csrfToken || preSessionMutation.data;

    if (!tokenToUse) {
      setError("root", {
        message: t("noCsrfToken"),
      });
      return;
    }

    try {
      // Determine if input is email or username based on @ character
      const isEmail = values.username.includes("@");

      await signInMutation.mutateAsync({
        ...(isEmail
          ? { email: values.username }
          : { username: values.username }),
        password: values.password,
        csrfToken: tokenToUse,
      });

      // Refresh session to load user data and CSRF token
      await refreshSession();
      navigate("/home");
    } catch (error) {
      setError("root", {
        message: translateError(error),
      });
    }
  }

  const isSubmitting = signInMutation.isPending;
  const errors = form.formState.errors;

  return (
    <div className="h-svh">
      <CenteredPage>
        <div className="w-sm flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("signInTitle")}</CardTitle>
              <CardDescription>{t("signInDescription")}</CardDescription>
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
                        <FormLabel>{t("usernameOrEmail")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("usernameOrEmailPlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("password")}</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder={t("passwordPlaceholder")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {t("submit", { ns: "common" })}
                  </Button>
                  {errors.root?.message && !isSubmitting && (
                    <div className="text-destructive text-sm text-center">
                      {errors.root?.message}
                    </div>
                  )}
                  <div className="mt-4 text-center text-sm">
                    {t("dontHaveAccount")}{" "}
                    <Link
                      to="/auth/sign-up"
                      className="underline underline-offset-4"
                    >
                      {t("signUp")}
                    </Link>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
          <div className="flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>
      </CenteredPage>
    </div>
  );
}
