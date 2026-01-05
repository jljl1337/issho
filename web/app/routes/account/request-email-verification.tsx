import { useEffect } from "react";
import { useNavigate } from "react-router";

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
import { Form } from "~/components/ui/form";

import { CenteredPage } from "~/components/layouts/centered-page";
import { useSession } from "~/contexts/session-context";
import { useRequestEmailVerification } from "~/hooks/use-user";
import { translateError } from "~/lib/db/common";

const formSchema = z.object({});

export default function Page() {
  const { t } = useTranslation(["user", "auth", "common"]);
  const { user, isLoggedIn, isLoading, csrfToken } = useSession();
  const navigate = useNavigate();
  const requestEmailVerification = useRequestEmailVerification();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    document.title = `${t("requestEmailVerification")} | Issho`;
  }, [t]);

  async function onSubmit() {
    if (!csrfToken) {
      form.setError("root", { message: "No CSRF token available" });
      return;
    }

    try {
      await requestEmailVerification.mutateAsync(csrfToken);
      navigate("/account/confirm-email-verification");
    } catch (error) {
      const translatedError = translateError(error);
      form.setError("root", { message: translatedError });
    }
  }

  const isSubmitting = requestEmailVerification.isPending;
  const errors = form.formState.errors;

  return (
    <>
      <CenteredPage>
        <Card className="w-sm">
          <CardHeader>
            <CardTitle>{t("requestEmailVerification")}</CardTitle>
            <CardDescription>
              {t("requestEmailVerificationDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {t("sendVerificationEmail")}
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
