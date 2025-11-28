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
import { useLanguage } from "~/contexts/language-context";
import { useSession } from "~/contexts/session-context";
import { useSignUp } from "~/hooks/use-auth";
import { translateError } from "~/lib/db/common";
import {
  emailSchema,
  passwordWithConfirmSchema,
  usernameSchema,
} from "~/lib/schemas/auth";

const formSchema = z.intersection(
  z.intersection(usernameSchema, emailSchema),
  passwordWithConfirmSchema,
);

export default function Page() {
  const { t } = useTranslation(["auth", "common"]);
  const navigate = useNavigate();
  const { isLoggedIn, isLoading } = useSession();
  const { language } = useLanguage();
  const signUpMutation = useSignUp();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      navigate("/home");
    }
  }, [isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    document.title = `${t("signUp")} | Issho`;
  }, [t]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { setError } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await signUpMutation.mutateAsync({
        username: values.username,
        email: values.email,
        password: values.password,
        languageCode: language,
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
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("signUpTitle")}</CardTitle>
                <CardDescription>{t("signUpDescription")}</CardDescription>
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
                          <FormLabel>{t("username")}</FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("usernamePlaceholder")}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("email")}</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder={t("emailPlaceholder")}
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
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("confirmPassword")}</FormLabel>
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
                      {t("alreadyHaveAccount")}{" "}
                      <Link
                        to="/auth/sign-in"
                        className="underline underline-offset-4"
                      >
                        {t("signIn")}
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
