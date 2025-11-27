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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import { useLanguage } from "~/contexts/language-context";
import { useSession } from "~/contexts/session-context";

const languages = [
  { code: "en-US", name: "English (US)", nativeName: "English (US)" },
  { code: "zh-HK", name: "Chinese (HK)", nativeName: "中文 (香港)" },
] as const;

type LanguageCode = (typeof languages)[number]["code"];

const formSchema = z.object({
  language: z.enum(["en-US", "zh-HK"]),
});

export default function Page() {
  const { t } = useTranslation();
  const { isLoggedIn, isLoading: sessionLoading, csrfToken } = useSession();
  const { language, setLanguage, isUpdating } = useLanguage();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      language: language,
    },
  });

  const { setError } = form;

  useEffect(() => {
    if (!sessionLoading && !isLoggedIn) {
      navigate("/auth/sign-in");
    }
  }, [isLoggedIn, sessionLoading, navigate]);

  useEffect(() => {
    form.reset({ language });
  }, [language, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!csrfToken) {
      setError("root", {
        message: t("user.noCsrfToken"),
      });
      return;
    }

    const result = await setLanguage(values.language, csrfToken);

    if (result.error) {
      setError("root", {
        message: result.error,
      });
      return;
    }

    navigate("/account");
  }

  const errors = form.formState.errors;

  return (
    <>
      <title>{t("user.languageSettings")} | Issho</title>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("user.languageSettings")}</CardTitle>
                <CardDescription>{t("user.chooseLanguage")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("user.language")}</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {languages.map((lang) => (
                                <SelectItem key={lang.code} value={lang.code}>
                                  {lang.nativeName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full cursor-pointer"
                      disabled={isUpdating}
                    >
                      {t("common.save")}
                    </Button>
                    {errors.root && (
                      <div className="text-sm text-destructive text-center">
                        {errors.root.message}
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
