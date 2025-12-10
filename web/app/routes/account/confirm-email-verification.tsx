import { useEffect } from "react";
import { useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";

import { useSession } from "~/contexts/session-context";
import { useConfirmEmailVerification } from "~/hooks/use-user";
import { translateError } from "~/lib/db/common";

export default function Page() {
  const { t } = useTranslation(["user", "auth", "common", "validation"]);
  const { user, isLoggedIn, isLoading, csrfToken } = useSession();
  const navigate = useNavigate();
  const confirmEmailVerification = useConfirmEmailVerification();

  const formSchema = z.object({
    code: z.string().min(5, t("validation:verificationCodeMinLength")),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, isLoading, navigate]);

  useEffect(() => {
    document.title = `${t("confirmEmailVerification")} | Issho`;
  }, [t]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!csrfToken) {
      form.setError("root", { message: "No CSRF token available" });
      return;
    }

    try {
      await confirmEmailVerification.mutateAsync({
        code: values.code,
        csrfToken,
      });
      navigate("/account");
    } catch (error) {
      const translatedError = translateError(error);
      form.setError("root", { message: translatedError });
    }
  }

  const isSubmitting = confirmEmailVerification.isPending;
  const errors = form.formState.errors;

  return (
    <>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("confirmEmailVerification")}</CardTitle>
                <CardDescription>
                  {t("confirmEmailVerificationDesc")}
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
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("verificationCode")}</FormLabel>
                          <FormControl>
                            <div className="flex justify-center">
                              <InputOTP
                                maxLength={5}
                                pattern={"^[A-Z0-9]+$"}
                                {...field}
                              >
                                <InputOTPGroup>
                                  <InputOTPSlot index={0} />
                                  <InputOTPSlot index={1} />
                                  <InputOTPSlot index={2} />
                                  <InputOTPSlot index={3} />
                                  <InputOTPSlot index={4} />
                                </InputOTPGroup>
                              </InputOTP>
                            </div>
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
                      {t("verify")}
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
