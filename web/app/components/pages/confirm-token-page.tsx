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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";

import { CenteredPage } from "~/components/layouts/centered-page";

interface ConfirmTokenPageProps {
  title: string;
  description: string;
  onSubmit: (code: string) => Promise<void>;
  isSubmitting: boolean;
  error?: string;
}

export function ConfirmTokenPage({
  title,
  description,
  onSubmit,
  isSubmitting,
  error,
}: ConfirmTokenPageProps) {
  const { t } = useTranslation(["user", "validation"]);

  const formSchema = z.object({
    code: z.string().min(5, t("validation:verificationCodeMinLength")),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    await onSubmit(values.code);
  }

  return (
    <CenteredPage>
      <Card className="w-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
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
              {error && !isSubmitting && (
                <div className="text-destructive text-sm text-center">
                  {error}
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </CenteredPage>
  );
}
