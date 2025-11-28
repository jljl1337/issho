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

import { useSession } from "~/contexts/session-context";
import { useUpdateEmail } from "~/hooks/use-user";
import { translateError } from "~/lib/db/common";
import { emailSchema } from "~/lib/schemas/auth";

export default function Page() {
  const { t } = useTranslation(["user", "auth", "common"]);
  const { csrfToken, isLoggedIn, isLoading } = useSession();
  const navigate = useNavigate();
  const updateEmailMutation = useUpdateEmail();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    document.title = `${t("changeEmail")} | Issho`;
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
      await updateEmailMutation.mutateAsync({
        newEmail: values.email,
        csrfToken,
      });
      navigate("/account");
    } catch (error) {
      setError("root", {
        message: translateError(error),
      });
    }
  }

  const isSubmitting = updateEmailMutation.isPending;
  const errors = form.formState.errors;

  return (
    <>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("changeEmail")}</CardTitle>
                <CardDescription>{t("changeEmailDesc")}</CardDescription>
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
                          <FormLabel>{t("email", { ns: "auth" })}</FormLabel>
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
          </div>
        </div>
      </div>
    </>
  );
}
