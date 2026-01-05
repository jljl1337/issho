import { useEffect } from "react";
import { useNavigate } from "react-router";

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

import { CenteredPage } from "~/components/layouts/centered-page";
import { useSession } from "~/contexts/session-context";
import { useRequestEmailChange } from "~/hooks/use-user";
import { translateError } from "~/lib/db/common";
import { emailSchema } from "~/lib/schemas/auth";

export default function Page() {
  const { t } = useTranslation(["user", "auth", "common"]);
  const { csrfToken, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();
  const requestEmailChangeMutation = useRequestEmailChange();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    document.title = `${t("requestEmailChange")} | Issho`;
  }, [t]);

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const { setError } = form;

  async function onSubmit(values: z.infer<typeof emailSchema>) {
    if (!csrfToken) {
      setError("root", {
        message: t("noCsrfToken"),
      });
      return;
    }

    try {
      await requestEmailChangeMutation.mutateAsync({
        newEmail: values.email,
        csrfToken,
      });
      navigate("/account/confirm-email-change");
    } catch (error) {
      setError("root", {
        message: translateError(error),
      });
    }
  }

  const isSubmitting = requestEmailChangeMutation.isPending;
  const errors = form.formState.errors;

  return (
    <>
      <CenteredPage>
        <Card className="w-sm">
          <CardHeader>
            <CardTitle>{t("requestEmailChange")}</CardTitle>
            <CardDescription>{t("requestEmailChangeDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("newEmail")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("newEmailPlaceholder")}
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
                  {t("requestChange")}
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
    </>
  );
}
