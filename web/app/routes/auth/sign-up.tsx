import { useEffect } from "react";
import { Link, useNavigate } from "react-router";

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
import { useSession } from "~/contexts/session-context";
import { useSignUp } from "~/hooks/use-auth";
import { translateError } from "~/lib/db/common";
import { passwordWithConfirmSchema, usernameSchema } from "~/lib/schemas/auth";

const formSchema = z.intersection(usernameSchema, passwordWithConfirmSchema);

export default function Page() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoggedIn, isLoading } = useSession();
  const signUpMutation = useSignUp();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      navigate("/home");
    }
  }, [isLoggedIn, isLoading, navigate]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { setError } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Get current language from localStorage
      const languageCode = localStorage.getItem("issho_language") || "en-US";

      await signUpMutation.mutateAsync({
        username: values.username,
        password: values.password,
        languageCode,
      });
      navigate("/auth/sign-in");
    } catch (error) {
      setError("root", {
        message: translateError(error),
      });
    }
  }

  const isSubmitting = signUpMutation.isPending;
  const errors = form.formState.errors;

  return (
    <>
      <title>{t("auth.signUp")} | Issho</title>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("auth.signUpTitle")}</CardTitle>
                <CardDescription>{t("auth.signUpDescription")}</CardDescription>
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
                              placeholder={t("auth.usernamePlaceholder")}
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
                          <FormLabel>{t("auth.password")}</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder={t("auth.passwordPlaceholder")}
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
                              placeholder={t("auth.passwordPlaceholder")}
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
                      {t("common.submit")}
                    </Button>
                    {errors.root?.message && !isSubmitting && (
                      <div className="text-destructive text-sm text-center">
                        {errors.root?.message}
                      </div>
                    )}
                    <div className="mt-4 text-center text-sm">
                      {t("auth.alreadyHaveAccount")}{" "}
                      <Link
                        to="/auth/sign-in"
                        className="underline underline-offset-4"
                      >
                        {t("auth.signIn")}
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
        </div>
      </div>
    </>
  );
}
