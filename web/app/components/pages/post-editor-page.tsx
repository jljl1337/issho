import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import Editor from "@monaco-editor/react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";

import { DateTimePicker } from "~/components/datetime-picker";
import { MarkdownRenderer } from "~/components/markdown-renderer";
import { useTheme } from "~/components/theme-provider";

interface PostEditorPageProps {
  initialData?: {
    title: string;
    description: string;
    content: string;
    publishedAt: string | null;
  };
  onSave?: (data: {
    title: string;
    description: string;
    content: string;
    publishedAt: string | null;
  }) => Promise<void>;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export function PostEditorPage({
  initialData,
  onSave,
  isLoading = false,
  errorMessage = null,
}: PostEditorPageProps) {
  const { t } = useTranslation(["post", "validation"]);
  const { resolvedTheme } = useTheme();

  const formSchema = z.object({
    title: z.string().min(1, t("titleRequired", { ns: "validation" })),
    description: z.string(),
    content: z.string(),
    publishedAt: z.string().nullable(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      content: initialData?.content || "",
      publishedAt: initialData?.publishedAt || null,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description,
        content: initialData.content,
        publishedAt: initialData.publishedAt,
      });
    }
  }, [initialData, form]);

  const handleDateChange = (date: Date | null) => {
    form.setValue("publishedAt", date ? date.toISOString() : null, {
      shouldValidate: true,
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (onSave) {
      await onSave(values);
    }
  };

  const publishedAtValue = form.watch("publishedAt");
  const publishedAtDate = publishedAtValue ? new Date(publishedAtValue) : null;

  const contentValue = form.watch("content");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex h-full w-full"
      >
        {/* Main content area with editor and preview */}
        <div className="flex flex-1 overflow-hidden">
          {/* Editor */}
          <div className="flex w-1/2 flex-col border-r">
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold">
                {t("editor", { ns: "post" })}
              </h2>
            </div>
            <div className="flex-1 overflow-hidden">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <Editor
                    height="100%"
                    defaultLanguage="markdown"
                    value={field.value}
                    onChange={(value) => field.onChange(value || "")}
                    theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "on",
                      wordWrap: "on",
                      padding: { top: 16 },
                    }}
                  />
                )}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="flex w-1/2 min-w-0 flex-col">
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold">
                {t("preview", { ns: "post" })}
              </h2>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <MarkdownRenderer content={contentValue} />
            </div>
          </div>
        </div>

        {/* Right sidebar for metadata */}
        <div className="flex w-96 flex-col border-l bg-muted/30">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">
              {t("postSettings", { ns: "post" })}
            </h2>
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="flex flex-col gap-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("title", { ns: "post" })}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("titlePlaceholder", { ns: "post" })}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("description", { ns: "post" })}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("descriptionPlaceholder", {
                          ns: "post",
                        })}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              {/* Publish DateTime */}
              <DateTimePicker
                value={publishedAtDate}
                onChange={handleDateChange}
                label={t("publishDateTime", { ns: "post" })}
              />

              <Separator />

              {/* Error Message */}
              {errorMessage && (
                <div className="text-sm text-destructive">{errorMessage}</div>
              )}

              {/* Save Button */}
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading
                  ? t("saving", { ns: "post" })
                  : t("savePost", { ns: "post" })}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}
