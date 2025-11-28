import { z } from "zod";

import i18n from "~/i18n";

export const usernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, i18n.t("validation.usernameMinLength"))
    .max(30, i18n.t("validation.usernameMaxLength"))
    .regex(/^[a-z0-9_]+$/, i18n.t("validation.usernameInvalidFormat")),
});

export const emailSchema = z.object({
  email: z
    .string()
    .trim()
    .email(i18n.t("validation.emailInvalid"))
    .min(1, i18n.t("validation.emailRequired")),
});

const password = z
  .string()
  .min(8, i18n.t("validation.passwordMinLength"))
  .max(64, i18n.t("validation.passwordMaxLength"))
  .regex(/^[A-Za-z0-9!@#$%^&*]+$/, {
    message: i18n.t("validation.passwordInvalidFormat"),
  });

export const passwordSchema = z.object({
  password: password,
});

export const passwordWithConfirmSchema = passwordSchema
  .extend({
    ...passwordSchema.shape,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: i18n.t("validation.passwordsDoNotMatch"),
    path: ["confirmPassword"],
  });

export const updatePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, i18n.t("validation.oldPasswordRequired")),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: i18n.t("validation.passwordsDoNotMatch"),
    path: ["confirmPassword"],
  });
