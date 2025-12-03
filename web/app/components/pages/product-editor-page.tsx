import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "~/components/ui/textarea";

import { VerticallyCenterPage } from "~/components/pages/vertically-center-page";

interface ProductEditorPageProps {
  initialData?: {
    name: string;
    description: string;
    priceAmount: number;
    priceCurrency: string;
    isRecurring: boolean;
    recurringInterval: string | null;
    recurringIntervalCount: number | null;
    isActive: boolean;
  };
  onSave?: (data: {
    name: string;
    description: string;
    priceAmount: number;
    priceCurrency: string;
    isRecurring: boolean;
    recurringInterval: string | null;
    recurringIntervalCount: number | null;
    isActive: boolean;
  }) => Promise<void>;
  isLoading?: boolean;
  errorMessage?: string | null;
  mode: "create" | "edit";
}

export function ProductEditorPage({
  initialData,
  onSave,
  isLoading = false,
  errorMessage = null,
  mode,
}: ProductEditorPageProps) {
  const { t } = useTranslation(["product", "validation"]);

  const formSchema = z.object({
    name: z.string().min(1, t("nameRequired", { ns: "validation" })),
    description: z.string(),
    priceAmount: z.number().min(0, t("priceRequired", { ns: "validation" })),
    priceCurrency: z
      .string()
      .min(1, t("currencyRequired", { ns: "validation" })),
    isRecurring: z.boolean(),
    recurringInterval: z.string().nullable(),
    recurringIntervalCount: z.number().nullable(),
    isActive: z.boolean(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      priceAmount: initialData?.priceAmount || 0,
      priceCurrency: initialData?.priceCurrency || "usd",
      isRecurring: Boolean(initialData?.isRecurring),
      recurringInterval: initialData?.recurringInterval || null,
      recurringIntervalCount: initialData?.recurringIntervalCount || null,
      isActive:
        initialData?.isActive !== undefined
          ? Boolean(initialData.isActive)
          : true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description,
        priceAmount: initialData.priceAmount,
        priceCurrency: initialData.priceCurrency,
        isRecurring: Boolean(initialData.isRecurring),
        recurringInterval: initialData.recurringInterval,
        recurringIntervalCount: initialData.recurringIntervalCount,
        isActive: Boolean(initialData.isActive),
      });
    }
  }, [initialData, form]);

  const isRecurring = form.watch("isRecurring");

  // Clear recurring fields when isRecurring is set to false
  useEffect(() => {
    if (!isRecurring) {
      form.setValue("recurringInterval", null);
      form.setValue("recurringIntervalCount", null);
    }
  }, [isRecurring, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (onSave) {
      // Ensure recurring fields are null when not recurring
      const submissionData = {
        ...values,
        recurringInterval: values.isRecurring ? values.recurringInterval : null,
        recurringIntervalCount: values.isRecurring
          ? values.recurringIntervalCount
          : null,
      };
      await onSave(submissionData);
    }
  };

  return (
    <VerticallyCenterPage className="max-w-2xl">
      <div className="flex flex-col gap-6">
        <h1 className="text-4xl">
          {mode === "create" ? t("createProduct") : t("editProduct")}
        </h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("namePlaceholder")} {...field} />
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
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("descriptionPlaceholder")}
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Price Amount */}
            <FormField
              control={form.control}
              name="priceAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("price")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        field.onChange(isNaN(value) ? 0 : value);
                      }}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price Currency */}
            <FormField
              control={form.control}
              name="priceCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("currency")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("selectCurrency")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="usd">{t("currencyUSD")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Is Recurring */}
            <FormField
              control={form.control}
              name="isRecurring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked === true);
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t("recurring")}</FormLabel>
                    <FormDescription>
                      {t("recurringDescription")}
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recurring Interval - Only show if isRecurring is true */}
            {isRecurring && (
              <>
                <FormField
                  control={form.control}
                  name="recurringInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("recurringInterval")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t("selectInterval")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="day">
                            {t("intervalDay")}
                          </SelectItem>
                          <SelectItem value="week">
                            {t("intervalWeek")}
                          </SelectItem>
                          <SelectItem value="month">
                            {t("intervalMonth")}
                          </SelectItem>
                          <SelectItem value="year">
                            {t("intervalYear")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recurringIntervalCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("recurringIntervalCount")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            field.onChange(isNaN(value) ? null : value);
                          }}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        {t("recurringIntervalCountDescription")}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Separator />

            {/* Is Active */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked === true);
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t("active")}</FormLabel>
                    <FormDescription>{t("activeDescription")}</FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Error Message */}
            {errorMessage && (
              <div className="text-sm text-destructive">{errorMessage}</div>
            )}

            {/* Save Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full cursor-pointer"
            >
              {isLoading ? t("saving") : t("saveProduct")}
            </Button>
          </form>
        </Form>
      </div>
    </VerticallyCenterPage>
  );
}
